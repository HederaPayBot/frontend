// src/components/dashboard/WalletInfo.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  value: number; // USD value
  logo?: string;
}

export function WalletInfo() {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [hederaId, setHederaId] = useState<string>(user?.hederaAccountId || '');
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  // Fetch token balances
  useEffect(() => {
    if (!user?.hederaAccountId) {
      setIsLoading(false);
      return;
    }
    
    // Simulating API call to get token balances
    const fetchBalances = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data - replace with actual API response
        setTokenBalances([
          {
            symbol: 'HBAR',
            name: 'Hedera',
            balance: 1250.75,
            value: 62.54,
            logo: '/tokens/hbar.png'
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            balance: 100.00,
            value: 100.00,
            logo: '/tokens/usdc.png'
          },
          {
            symbol: 'HSUITE',
            name: 'HashPack Suite',
            balance: 500,
            value: 25.00
          }
        ]);
        
      } catch (error) {
        console.error('Error fetching token balances:', error);
        toast.error("Failed to load token balances");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalances();
  }, [user?.hederaAccountId]);
  
  if (!user?.hederaAccountId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-700">
              Please link your Hedera account to view wallet information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-gray-500">Hedera Account</span>
            <div className="flex items-center">
              <span className="font-mono">{user.hederaAccountId}</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="ml-2 h-6 px-2"
                onClick={() => copyToClipboard(user.hederaAccountId || '')}
              >
                Copy
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-500 mb-2">Token Balances</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#8247E5]"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {tokenBalances.map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex items-center">
                      {token.logo ? (
                        <img src={token.logo} alt={token.symbol} className="w-8 h-8 mr-3" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                          {token.symbol.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-sm text-gray-500">{token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.balance.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">${token.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button className="bg-[#8247E5] hover:bg-[#7038d6] w-full">
              Receive
            </Button>
            <Button variant="outline" className="w-full">
              Explore Transactions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}