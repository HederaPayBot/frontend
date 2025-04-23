import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTokenAmount } from "@/utils/formatting";

interface TokenBalanceCardProps {
  tokenId: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  onSend?: (tokenId: string) => void;
}

export function TokenBalanceCard({ 
  tokenId, 
  symbol, 
  name, 
  balance, 
  decimals, 
  onSend 
}: TokenBalanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formattedBalance = formatTokenAmount(balance, decimals);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              {symbol.substring(0, 2)}
            </div>
            <div className="ml-3">
              <CardTitle className="text-lg font-medium">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{formattedBalance}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">ID: {tokenId}</p>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="border-t pt-4 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onSend?.(tokenId)}
                variant="default"
                className="bg-[#8247E5] hover:bg-[#7038d6]"
              >
                Send
              </Button>
              <Button
                variant="outline"
                className="text-gray-700"
                asChild
              >
                <a 
                  href={`https://hashscan.io/testnet/token/${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on HashScan
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="pt-1 pb-3 px-6">
        <Button 
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className="w-full text-center text-[#8247E5] text-sm hover:text-[#7038d6] hover:bg-purple-50"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      </CardFooter>
    </Card>
  );
} 