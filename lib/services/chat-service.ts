import { supabase, handleSupabaseError } from '@/lib/supabase';

export interface Message {
  id?: number;
  content: string;
  role: 'user' | 'assistant';
  created_time?: Date;
  conversation_id?: number;
}

export interface Conversation {
  id?: number;
  title?: string;
  user_id: string;
  created_time?: Date;
  updated_time?: Date;
  property_id?: number;
  messages?: Message[];
}

export class ChatService {
  /**
   * Create a new conversation
   */
  static async createConversation(userId: string, title?: string, propertyId?: number): Promise<number> {
    try {
      // First check if the user exists, if not create a demo user
      const { data: existingUser } = await supabase
        .from('user')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (!existingUser) {
        // Create a demo user if it doesn't exist
        await supabase
          .from('user')
          .insert({
            user_id: userId,
            email: `${userId}@example.com`, // Placeholder email
          });
      }
      
      const now = new Date().toISOString();
      
      // Now create the conversation
      const { data, error } = await supabase
        .from('conversation')
        .insert({
          user_id: userId,
          title: title || 'New Conversation',
          property_id: propertyId || null,
          created_time: now,
          updated_time: now
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating conversation:', error);
        // Fallback to a simpler insert without returning
        const insertResult = await supabase
          .from('conversation')
          .insert({
            user_id: userId,
            title: title || 'New Conversation',
            property_id: propertyId || null,
            created_time: now,
            updated_time: now
          });
          
        if (insertResult.error) {
          handleSupabaseError(insertResult.error, 'creating conversation');
        }
        
        // Get the last conversation for this user as a fallback
        const { data: lastConversation, error: lastError } = await supabase
          .from('conversation')
          .select('id')
          .eq('user_id', userId)
          .order('created_time', { ascending: false })
          .limit(1)
          .single();
          
        if (lastError) {
          handleSupabaseError(lastError, 'retrieving last conversation');
        }
        
        return lastConversation.id;
      }
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get a conversation by ID
   */
  static async getConversation(conversationId: number): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversation')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          return null;
        }
        console.error('Error getting conversation:', error);
        return null;
      }
      
      return data as Conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversation')
        .select('*')
        .eq('user_id', userId)
        .order('updated_time', { ascending: false });
      
      if (error) {
        console.error('Error getting user conversations:', error);
        return [];
      }
      
      return data as Conversation[];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Add a message to a conversation
   */
  static async addMessage(message: Message): Promise<number> {
    try {
      // Insert the message
      const { data, error } = await supabase
        .from('message')
        .insert({
          content: message.content,
          role: message.role,
          conversation_id: message.conversation_id
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error adding message:', error);
        
        // Fallback to a simpler insert without returning
        const insertResult = await supabase
          .from('message')
          .insert({
            content: message.content,
            role: message.role,
            conversation_id: message.conversation_id
          });
          
        if (insertResult.error) {
          console.error('Error in fallback message insert:', insertResult.error);
          return 0; // Return a placeholder ID
        }
      }
      
      // Update the conversation's updated_time
      if (message.conversation_id) {
        const { error: updateError } = await supabase
          .from('conversation')
          .update({ updated_time: new Date().toISOString() })
          .eq('id', message.conversation_id);
        
        if (updateError) {
          console.error('Error updating conversation timestamp:', updateError);
        }
      }
      
      return data?.id || 0;
    } catch (error) {
      console.error('Error adding message:', error);
      return 0;
    }
  }

  /**
   * Get all messages for a conversation
   */
  static async getConversationMessages(conversationId: number): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_time', { ascending: true });
      
      if (error) {
        console.error('Error getting conversation messages:', error);
        return [];
      }
      
      return data as Message[];
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  static async deleteConversation(conversationId: number): Promise<void> {
    try {
      // Delete all messages first (should cascade, but just to be safe)
      const { error: messagesError } = await supabase
        .from('message')
        .delete()
        .eq('conversation_id', conversationId);
      
      if (messagesError) {
        console.error('Error deleting conversation messages:', messagesError);
      }
      
      // Delete the conversation
      const { error: conversationError } = await supabase
        .from('conversation')
        .delete()
        .eq('id', conversationId);
      
      if (conversationError) {
        console.error('Error deleting conversation:', conversationError);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }
} 