'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SendPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main page and show a message
    router.push('/twitter-money');
    
    // Optional: show a toast to indicate that the send form is available on the main page
    toast.info('Send money form is available on the main page');
  }, [router]);
  
  // Return a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );
} 