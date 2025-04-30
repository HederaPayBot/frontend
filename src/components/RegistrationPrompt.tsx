'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function RegistrationPrompt() {
  const { user, registerUser, isLoading, error } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const handleRegister = async () => {
    if (!user?.twitterUsername) {
      return;
    }
    
    setIsRegistering(true);
    try {
      await registerUser(user.twitterUsername);
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome to TipTap!</CardTitle>
        <CardDescription>
          Complete your account setup to start sending and receiving tips.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Hi @{user?.twitterUsername}, we need to create an account for you to store your tips and transactions.
        </p>
        
        <p className="mb-4">
          By registering, you'll be able to:
        </p>
        
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Receive tips from other Twitter users</li>
          <li>Send tips to your favorite creators</li>
          <li>Link your Hedera wallet for managing your funds</li>
          <li>Track all your transactions in one place</li>
        </ul>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRegister} 
          disabled={isLoading || isRegistering}
          className="w-full"
        >
          {isLoading || isRegistering ? 'Setting up your account...' : 'Register Now'}
        </Button>
      </CardFooter>
    </Card>
  );
} 