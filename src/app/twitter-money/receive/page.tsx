'use client';

import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from '@/components/BottomNavigation';
import { toast } from 'sonner';

export default function ReceivePage() {
  const { user } = useApp();
  
  const handleCopyUsername = () => {
    if (!user?.twitterUsername) return;
    
    // Copy the username to clipboard
    navigator.clipboard.writeText('@' + user.twitterUsername);
    toast.success('Username copied to clipboard');
  };
  
  const handleShare = async () => {
    if (!user?.twitterUsername) return;
    
    const shareText = `Send me crypto on Twitter using @hederapaybot! My username is @${user.twitterUsername}`;
    
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share Twitter Money Address',
          text: shareText,
        });
        toast.success('Shared successfully');
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast.success('Share text copied to clipboard');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {/* Header */}
      <header className="bg-white p-4 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Receive Money</h1>
          <div className="bg-gray-200 rounded-full px-3 py-1">
            @{user?.twitterUsername || 'blockchain_oracle'}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Your Twitter Handle</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            {/* Mock QR Code */}
            <div className="w-56 h-56 bg-white border border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <p className="font-bold text-2xl">@{user?.twitterUsername || 'yourusername'}</p>
                <p className="text-gray-500 text-sm mt-2">Show this to receive payments</p>
              </div>
            </div>
            
            <div className="w-full flex flex-col space-y-2">
              <Button onClick={handleCopyUsername} className="w-full">
                Copy Twitter Handle
              </Button>
              <Button onClick={handleShare} variant="outline" className="w-full">
                Share Payment Request
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 text-center mt-2">
              People can send you money by mentioning @hederapaybot on Twitter with your handle.
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        items={[
          { label: 'Home', href: '/twitter-money' },
          { label: 'Send', href: '/twitter-money/send' },
          { label: 'Receive', href: '/twitter-money/receive' }
        ]}
      />
    </div>
  );
} 