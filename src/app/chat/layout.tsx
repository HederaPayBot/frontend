import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HederaPayBot - Interactive Chat',
  description: 'Chat directly with the HederaPayBot to interact with the Hedera blockchain',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="chat-layout">
      {children}
    </div>
  )
} 