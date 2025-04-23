import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";

interface AccountDisplayProps {
  showLinkForm?: boolean;
}

export function AccountDisplay({ showLinkForm = false }: AccountDisplayProps) {
  const { user, linkHederaAccount, isLoading } = useApp();
  const [newAccountId, setNewAccountId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccountLink = async () => {
    if (!newAccountId) {
      setError('Please enter a Hedera account ID');
      return;
    }

    // Simple validation for Hedera account ID format (0.0.12345)
    const hederaIdPattern = /^0\.0\.\d+$/;
    if (!hederaIdPattern.test(newAccountId)) {
      setError('Invalid Hedera account ID format (should be like 0.0.12345)');
      return;
    }

    try {
      setIsLinking(true);
      setError(null);
      await linkHederaAccount(newAccountId);
      setNewAccountId('');
    } catch (err: any) {
      setError(err.message || 'Failed to link account');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Hedera Account</CardTitle>
      </CardHeader>
      <CardContent>
        {user?.hederaAccountId ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account ID:</span>
              <span className="font-mono text-sm">{user.hederaAccountId}</span>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full text-sm"
                asChild
              >
                <a
                  href={`https://hashscan.io/testnet/account/${user.hederaAccountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on HashScan
                </a>
              </Button>
            </div>
          </div>
        ) : showLinkForm ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Link your Hedera account to send and receive payments.</p>
            
            <div className="space-y-2">
              <Input
                placeholder="Hedera Account ID (0.0.12345)"
                value={newAccountId}
                onChange={(e) => setNewAccountId(e.target.value)}
                className="w-full"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            
            <Button
              onClick={handleAccountLink}
              className="w-full bg-[#8247E5] hover:bg-[#7038d6]"
              disabled={isLoading || isLinking}
            >
              {isLinking ? 'Linking...' : 'Link Account'}
            </Button>
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