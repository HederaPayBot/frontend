import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { TokenBalance } from '@/utils/api';

interface TokenBalancesProps {
  className?: string;
  showRefresh?: boolean;
}

export function TokenBalances({ className, showRefresh = true }: TokenBalancesProps) {
  const { user, refreshBalances, isLoading } = useApp();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);

  // Load token balances when component mounts or user changes
  useEffect(() => {
    if (user?.twitterUsername) {
      loadBalances();
    }
  }, [user?.twitterUsername]);

  const loadBalances = async () => {
    if (!user?.twitterUsername) return;
    
    setIsRefreshing(true);
    try {
      await refreshBalances();
      setBalances(user.balances || []);
    } catch (error) {
      console.error("Failed to load token balances:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    const value = parseFloat(balance);
    return value.toFixed(decimals);
  };

  const renderTokenIcon = (type: string, symbol: string) => {
    if (symbol === 'HBAR') {
      return (
        <div className="w-8 h-8 rounded-full bg-[#8247E5] text-white flex items-center justify-center font-bold text-xs">
          ℏ
        </div>
      );
    }
    
    // Default icon for other tokens
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
        {symbol.substring(0, 2)}
      </div>
    );
  };

  const handleRefresh = () => {
    loadBalances();
  };

  const isLinked = !!user?.hederaAccountId;
  const loading = isLoading || isRefreshing;

  if (!balances || balances.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-xs sm:text-sm">No token balances found</p>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Token Balances</CardTitle>
        {showRefresh && isLinked && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8247E5]"></div>
          </div>
        ) : !isLinked ? (
          <div className="text-center py-4 text-sm text-gray-500">
            Link your Hedera account to view token balances
          </div>
        ) : (
          <div className="space-y-2">
            {balances.map((balance) => (
              <div
                key={balance.symbol}
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {balance.symbol.substring(0, 1)}
                  </div>
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{balance.symbol}</p>
                    <p className="text-muted-foreground text-xs">{balance.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs sm:text-sm">
                    {parseFloat(balance.balance).toLocaleString()} {balance.symbol}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    ≈ ${parseFloat(balance.balanceInUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 