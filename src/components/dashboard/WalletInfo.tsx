// src/components/dashboard/WalletInfo.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Twitter, Copy, ExternalLink, RefreshCw, ArrowUpRight, Shield, Key, Info, Wallet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { LinkOrRegisterModal } from "@/components/LinkOrRegisterModal";
import { TokenBalance } from '@/utils/api';

export function WalletInfo() {
  const { user, isLinked, refreshBalances, refreshProfile, isLoading } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  const handleRefresh = async () => {
    if (!user?.twitterUsername) return;
    
    setIsRefreshing(true);
    try {
      await refreshProfile();
      await refreshBalances();
      toast.success("Profile data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const formatBalance = (balance: string, decimals: number) => {
    const value = parseFloat(balance);
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  };
  
  const calculateTotalValueUSD = () => {
    if (!user?.balances) return 0;
    
    return user.balances.reduce((total, token) => {
      let usdValue = 0;
      switch(token.tokenSymbol) {
        case 'HBAR':
          usdValue = parseFloat(token.balance) * 0.07;
          break;
        case 'USDC':
        case 'USDT':
          usdValue = parseFloat(token.balance);
          break;
        default:
          usdValue = parseFloat(token.balance) * 0.01;
      }
      return total + usdValue;
    }, 0);
  };
  
  const renderTokenIcon = (type: string, symbol: string) => {
    const baseClasses = "w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-md transition-transform hover:scale-105";
    
    switch(symbol) {
      case 'HBAR':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-[#8247E5] to-[#6937b8]`}>
            ℏ
          </div>
        );
      case 'USDC':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-blue-500 to-blue-600`}>
            ${symbol.substring(0, 1)}
          </div>
        );
      case 'USDT':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-green-500 to-green-600`}>
            ${symbol.substring(0, 1)}
          </div>
        );
      default:
        return type === 'non-fungible' ? (
          <div className={`${baseClasses} bg-gradient-to-br from-purple-500 to-pink-500`}>
            NFT
          </div>
        ) : (
          <div className={`${baseClasses} bg-gradient-to-br from-gray-500 to-gray-600`}>
            {symbol.substring(0, 2)}
          </div>
        );
    }
  };
  
  const loading = isLoading || isRefreshing;
  const totalValueUSD = calculateTotalValueUSD();
  
  if (!user) {
    return (
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8247E5]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!isLinked) {
    return (
      <Card className="border border-gray-200 shadow-lg overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-white rounded-xl border">
            <Avatar className="h-20 w-20 mb-4 mx-auto border-4 border-white shadow-xl">
              <AvatarImage src={`https://unavatar.io/twitter/${user?.twitterUsername}`} alt={user?.twitterUsername} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                {user?.twitterUsername?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="font-semibold text-xl">@{user?.twitterUsername}</h3>
                <a 
                  href={`https://twitter.com/${user?.twitterUsername}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Info className="h-4 w-4" />
                Joined {new Date(user?.registeredAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <Alert className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <AlertDescription className="text-yellow-800 font-medium">
              Link your Hedera account to access your wallet features
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center">
            <LinkOrRegisterModal 
              triggerText="Connect Hedera Account" 
              className="bg-gradient-to-r from-[#8247E5] to-[#6937b8] hover:from-[#7038d6] hover:to-[#5826a7] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium px-8"
            />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <CardTitle className="flex items-center text-base sm:text-lg">
          Hedera Wallet
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 w-8 p-0 text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* User Profile & Account Banner */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-100 via-purple-50 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white to-transparent"></div>
          
          <div className="flex items-start space-x-3 sm:space-x-4 relative z-10">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white shadow-md">
              <AvatarImage src={`https://unavatar.io/twitter/${user?.twitterUsername}`} alt={user?.twitterUsername} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-sm">
                {user?.twitterUsername?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="font-medium text-base sm:text-lg truncate mr-1">@{user?.twitterUsername}</h3>
                <a 
                  href={`https://twitter.com/${user?.twitterUsername}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-0.5 text-blue-500 hover:text-blue-600 flex-shrink-0"
                >
                  <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </div>
              
              <div className="mt-1 flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-1 sm:gap-2">
                <p className="text-purple-700 font-semibold">
                  Est. Value: ${totalValueUSD.toFixed(2)} USD
                </p>
                <div className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">
                  {user.networkType || 'testnet'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Information Panel */}
        <div className="bg-white p-3 sm:p-4 border-t border-b">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3 flex items-center">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Account Information
          </h4>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-xs text-gray-500">
                <Key className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" /> Account ID
              </div>
              <div className="flex items-center flex-wrap">
                <code className="font-mono text-xs sm:text-sm mr-1 bg-gray-100 py-1 px-2 rounded text-gray-800 max-w-full overflow-x-auto">
                  {user?.hederaAccountId}
                </code>
                <div className="flex mt-1 sm:mt-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(user?.hederaAccountId || '')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(`https://hashscan.io/${user?.networkType || 'testnet'}/account/${user?.hederaAccountId}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {user?.keyType && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Key className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" /> Key Type
                </div>
                <div className="flex items-center">
                  <code className="font-mono text-xs sm:text-sm bg-gray-100 py-1 px-2 rounded text-gray-800">
                    {user.keyType}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Token Balances Section */}
        <div className="p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3 flex items-center">
            Token Balances
          </h4>
          
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#8247E5]"></div>
            </div>
          ) : (user.balances?.length === 0) ? (
            <div className="text-center py-6 text-xs sm:text-sm text-gray-500">
              No tokens found in your account
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {user.balances?.map((token) => (
                <div 
                  key={token.tokenId} 
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg border hover:border-purple-200 hover:bg-purple-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {renderTokenIcon(token.type, token.tokenSymbol)}
                    <div>
                      <div className="font-medium text-sm sm:text-base">{token.tokenSymbol}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]">{token.tokenName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm sm:text-base">
                      {formatBalance(token.balance, token.decimals)}
                    </div>
                    <div 
                      className="text-[10px] sm:text-xs text-gray-500 truncate w-[80px] sm:w-[120px] cursor-pointer text-right"
                      onClick={() => copyToClipboard(token.tokenId)}
                      title="Click to copy token ID"
                    >
                      {token.tokenId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* View in HashScan button */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t">
          <Button 
            variant="outline" 
            className="w-full text-xs sm:text-sm border-gray-300 hover:bg-gray-100 transition-all" 
            onClick={() => window.open(`https://hashscan.io/${user?.networkType || 'testnet'}/account/${user?.hederaAccountId}`, '_blank')}
          >
            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            View in HashScan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}