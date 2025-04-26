// src/components/dashboard/TwitterCommandBuilder.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenSelector } from "@/components/TokenSelector";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

export function TwitterCommandBuilder() {
  const { user } = useApp();
  const [command, setCommand] = useState({
    action: 'send',
    amount: '',
    token: 'HBAR',
    recipient: '',
    message: ''
  });
  
  const buildTwitterCommand = () => {
    if (!command.recipient || !command.amount) {
      toast.error("Missing required fields", {
        description: "Please fill in both recipient and amount"
      });
      return;
    }
    
    let tweetText = `@hedera_pay ${command.action} ${command.amount} ${command.token} to @${command.recipient}`;
    
    if (command.message) {
      tweetText += ` for ${command.message}`;
    }
    
    // Encode for URL
    const encodedText = encodeURIComponent(tweetText);
    
    // Open Twitter with pre-filled tweet
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Twitter Command</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Command Type</label>
            <select
              value={command.action}
              onChange={(e) => setCommand({...command, action: e.target.value})}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="send">Send Payment</option>
              <option value="request">Request Payment</option>
              <option value="balance">Check Balance</option>
            </select>
          </div>
          
          {command.action !== 'balance' && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Recipient</label>
                <Input
                  placeholder="Twitter username (without @)"
                  value={command.recipient}
                  onChange={(e) => setCommand({...command, recipient: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={command.amount}
                    onChange={(e) => setCommand({...command, amount: e.target.value})}
                  />
                </div>
                
                <TokenSelector
                  value={command.token}
                  onChange={(value) => setCommand({...command, token: value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Message (optional)</label>
                <Input
                  placeholder="e.g., lunch yesterday"
                  value={command.message}
                  onChange={(e) => setCommand({...command, message: e.target.value})}
                />
              </div>
            </>
          )}
          
          <div className="p-3 bg-gray-50 rounded-md border mt-4">
            <p className="text-sm font-medium mb-1">Preview:</p>
            <div className="font-mono text-sm bg-white p-2 rounded border">
              {command.action === 'balance' 
                ? '@hedera_pay balance' 
                : `@hedera_pay ${command.action} ${command.amount || '0'} ${command.token} to @${command.recipient || 'username'}${command.message ? ` for ${command.message}` : ''}`}
            </div>
          </div>
          
          <Button
            onClick={buildTwitterCommand}
            className="w-full bg-[#1DA1F2] hover:bg-[#1a94e0]"
          >
            Post to Twitter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}