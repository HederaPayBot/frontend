'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LinkAccountModalProps {
  triggerText?: string;
  className?: string;
}

export function LinkAccountModal({ 
  triggerText = "Link Hedera Account", 
  className = "" 
}: LinkAccountModalProps) {
  const { linkHederaAccount, isLoading: contextLoading } = useApp();
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [networkType, setNetworkType] = useState('testnet');
  const [keyType, setKeyType] = useState('ED25519');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  const isLoading = isLinking || contextLoading;

  const validateForm = () => {
    // Simple validation for Hedera account ID format (0.0.12345)
    const hederaIdPattern = /^0\.0\.\d+$/;
    if (!accountId.trim()) {
      return 'Please enter a Hedera account ID';
    }
    if (!hederaIdPattern.test(accountId)) {
      return 'Invalid Hedera account ID format (should be like 0.0.12345)';
    }
    
    if (!privateKey.trim()) {
      return 'Please enter a private key';
    }
    
    if (!networkType) {
      return 'Please select a network type';
    }
    
    if (!keyType) {
      return 'Please select a key type';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLinking(true);
      setError(null);
      
      // Pass all parameters to the linkHederaAccount function
      await linkHederaAccount(accountId, privateKey, networkType, keyType);
      
      toast.success("Account linked successfully", {
        description: `Hedera account ${accountId} has been linked to your profile.`
      });
      
      // Reset form
      setAccountId('');
      setPrivateKey('');
      setNetworkType('testnet');
      setKeyType('ED25519');
      setOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to link account');
      toast.error("Failed to link account", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Your Hedera Account</DialogTitle>
          <DialogDescription>
            Connect your Hedera account to enable transactions. Enter your Hedera account details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="Hedera Account ID (0.0.12345)"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                type="password"
                placeholder="Hedera Private Key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="networkType">Network Type</Label>
              <Select 
                value={networkType} 
                onValueChange={setNetworkType}
                disabled={isLoading}
              >
                <SelectTrigger id="networkType">
                  <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="previewnet">Previewnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keyType">Key Type</Label>
              <Select 
                value={keyType} 
                onValueChange={setKeyType}
                disabled={isLoading}
              >
                <SelectTrigger id="keyType">
                  <SelectValue placeholder="Select Key Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ED25519">ED25519</SelectItem>
                  <SelectItem value="ECDSA">ECDSA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-[#8247E5] hover:bg-[#7038d6]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                "Link Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 