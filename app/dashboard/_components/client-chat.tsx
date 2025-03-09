'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ChatInterface component with no SSR
const ChatInterface = dynamic(
  () => import('@/components/chat/chat-interface'),
  { ssr: false }
);

export function ClientChat() {
  return <ChatInterface />;
} 