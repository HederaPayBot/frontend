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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface LinkOrRegisterModalProps {
  triggerText?: string;
  className?: string;
}

export function LinkOrRegisterModal({ 
  triggerText = "Link or Register Account", 
  className = "" 
}: LinkOrRegisterModalProps) {
  const { user, registerUser, linkHederaAccount, isLoading: contextLoading } = useApp();
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [networkType, setNetworkType] = useState('testnet');
  const [keyType, setKeyType] = useState('ED25519');
  const [isLinking, setIsLinking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("link");
  
  const isLoading = isLinking || isRegistering || contextLoading;

  const validateLinkForm = () => {
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

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateLinkForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLinking(true);
      setError(null);
      
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

  const handleRegister = async () => {
    if (!user?.twitterUsername) {
      return;
    }
    
    setIsRegistering(true);
    setError(null);
    
    try {
      await registerUser(user.twitterUsername);
      toast.success("Registration successful", {
        description: "Your account has been registered. You can now link a Hedera account."
      });
      setOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register account');
      toast.error("Failed to register", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Your Hedera Account</DialogTitle>
          <DialogDescription>
            Choose to register a new account or link an existing Hedera account
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Register New Account</TabsTrigger>
            <TabsTrigger value="link">Link Existing Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Register New Account</CardTitle>
                <CardDescription>
                  Create a new TipTap account with your Twitter profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Hi @{user?.twitterUsername}, we'll create a new account for you to store your tips and transactions.
                </p>
                
                <p className="mb-2">By registering, you'll be able to:</p>
                
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>Receive tips from other Twitter users</li>
                  <li>Send tips to your favorite creators</li>
                  <li>Link your Hedera wallet for managing your funds</li>
                  <li>Track all your transactions in one place</li>
                </ul>
                
                {error && activeTab === "register" && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleRegister} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="link">
            <form onSubmit={handleLinkSubmit} className="space-y-4 py-4">
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
                
                {error && activeTab === "link" && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
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
                  {isLinking ? (
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 