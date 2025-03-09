'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Send, Home, Building, Search, History, Sparkles, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/lib/services/chat-service';
import { toast } from 'sonner';

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      conversationId: activeConversationId
    },
    onResponse: (response) => {
      console.log('Chat response received:', response);
      // Refresh conversations after a response
      fetchConversations();
    },
    onFinish: (message) => {
      console.log('Chat finished:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('chat');

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add message stream debugging
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch conversations from the API
  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Create a new conversation
  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Conversation',
        }),
      });
      
      const data = await response.json();
      
      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
        setMessages([]);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create new conversation');
    }
  };

  // Load a conversation
  const loadConversation = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      
      if (data.conversation) {
        setActiveConversationId(conversationId);
        
        // Format messages for the chat component
        if (data.conversation.messages) {
          setMessages(data.conversation.messages.map((message: any) => ({
            id: message.id.toString(),
            content: message.content,
            role: message.role,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
          setMessages([]);
        }
        
        fetchConversations();
        toast.success('Conversation deleted');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] w-full max-w-6xl mx-auto">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r p-4 space-y-4">
        <Button 
          variant="outline" 
          className="justify-start gap-2"
          onClick={createNewConversation}
          disabled={isLoadingConversations}
        >
          <PlusCircle size={16} />
          New Conversation
        </Button>
        
        <Separator />
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Property Tools</h3>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Search size={16} />
            Find Properties
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Building size={16} />
            Property Analysis
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Home size={16} />
            Mortgage Calculator
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Recent Conversations</h3>
          <div className="space-y-1">
            {isLoadingConversations ? (
              <div className="text-sm text-muted-foreground p-2">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">No conversations yet</div>
            ) : (
              conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center">
                  <Button 
                    variant={activeConversationId === conversation.id ? "secondary" : "ghost"} 
                    className="w-full justify-start text-left"
                    onClick={() => loadConversation(conversation.id!)}
                  >
                    <div className="truncate">{conversation.title}</div>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => deleteConversation(conversation.id!)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
          <div className="border-b px-4 py-2">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Welcome to Dibs AI</h2>
                <p className="text-muted-foreground max-w-md">
                  Your intelligent real estate assistant. Ask me about properties, market trends, investment strategies, or anything real estate related.
                </p>
                <div className="grid gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      handleInputChange({ target: { value: "What are the best neighborhoods for investment in Austin?" } } as any);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                      }, 100);
                    }}
                  >
                    What are the best neighborhoods for investment in Austin?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      handleInputChange({ target: { value: "Calculate mortgage payments for a $500,000 home with 20% down" } } as any);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                      }, 100);
                    }}
                  >
                    Calculate mortgage payments for a $500,000 home with 20% down
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => {
                      handleInputChange({ target: { value: "Compare renting vs buying in San Francisco" } } as any);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                      }, 100);
                    }}
                  >
                    Compare renting vs buying in San Francisco
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className={message.role === 'user' ? 'bg-primary' : 'bg-muted'}>
                          <span className="text-xs">{message.role === 'user' ? 'You' : 'AI'}</span>
                        </Avatar>
                        <Card className={message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                          <CardContent className="p-3">
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about real estate, properties, or market trends..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send size={18} />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="properties" className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="aspect-video bg-muted rounded-md mb-2"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">123 Main St, Austin, TX</h3>
                      <p className="text-sm text-muted-foreground">3 bed • 2 bath • 1,800 sqft</p>
                    </div>
                    <Badge>$450,000</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="aspect-video bg-muted rounded-md mb-2"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">456 Oak Ave, Austin, TX</h3>
                      <p className="text-sm text-muted-foreground">4 bed • 3 bath • 2,200 sqft</p>
                    </div>
                    <Badge>$550,000</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 p-4">
            <div className="space-y-4">
              {isLoadingConversations ? (
                <div className="text-center p-4">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-4">No conversations yet</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Your Conversations</h3>
                    {conversations.map((conversation) => (
                      <Card key={conversation.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{conversation.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(conversation.created_time!).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => loadConversation(conversation.id!)}
                              >
                                Open
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteConversation(conversation.id!)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 