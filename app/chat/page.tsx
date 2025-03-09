import Chat from '@/components/chat';
import PageWrapper from '@/components/wrapper/page-wrapper';

export default function ChatPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8">AI Chat</h1>
        <Chat />
      </div>
    </PageWrapper>
  );
} 