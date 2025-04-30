import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkOrRegisterModal } from "@/components/LinkOrRegisterModal";
import { useApp } from "@/context/AppContext";
import { ExternalLink } from "lucide-react";

interface AccountDisplayProps {
  showLinkForm?: boolean;
}

export function AccountDisplay({ showLinkForm = false }: AccountDisplayProps) {
  const { user, isLoading } = useApp();

  const isLinked = !!user?.hederaAccountId;

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
      <CardHeader>
        <CardTitle className="text-lg">Hedera Account</CardTitle>
      </CardHeader>
      <CardContent>
        {isLinked ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account ID:</span>
              <span className="font-mono text-sm">{user?.hederaAccountId}</span>
            </div>
            <div className="mt-4">
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