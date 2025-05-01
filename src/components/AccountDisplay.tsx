import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkOrRegisterModal } from "@/components/LinkOrRegisterModal";
import { useApp } from "@/context/AppContext";
import { ExternalLink, RefreshCw } from "lucide-react";

interface AccountDisplayProps {
  showLinkForm?: boolean;
}

export function AccountDisplay({ showLinkForm = false }: AccountDisplayProps) {
  const { user, isLoading, isBalanceLoading, refreshHbarBalance } = useApp();

  const isLinked = !!user?.hederaAccountId;

  // Format HBAR balance with commas and 2 decimal places
  const formattedBalance = user?.hbarBalance 
    ? Number(user.hbarBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
    : '0.00';

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Hedera Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#8247E5]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Hedera Account</CardTitle>
        {isLinked && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => refreshHbarBalance()}
            disabled={isBalanceLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isBalanceLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh balance</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLinked ? (
          <div>
            {/* HBAR Balance */}
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Balance</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold">{formattedBalance}</span>
                <span className="text-sm font-medium text-gray-600 mb-0.5">HBAR</span>
              </div>
            </div>

            {/* Account ID */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Account ID:</span>
              <span className="font-mono text-sm">{user?.hederaAccountId}</span>
            </div>

            {/* View on HashScan */}
            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-sm"
                asChild
              >
                <a
                  href={`https://hashscan.io/testnet/account/${user?.hederaAccountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  View on HashScan
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        ) : showLinkForm ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Register an account or link your existing Hedera account to start using TipTap.
            </p>
            <LinkOrRegisterModal 
              triggerText="Register or Link Account" 
              className="w-full bg-[#8247E5] hover:bg-[#7038d6] text-white" 
            />
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">No Hedera account linked</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 