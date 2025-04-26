import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Key, User, Globe, Shield } from 'lucide-react';

interface HederaAccountFormProps {
  onSubmit?: (accountData: {
    accountId: string;
    privateKey: string;
    publicKey: string;
    networkType: string;
    keyType: string;
  }) => Promise<void>;
}

export function HederaAccountForm({ onSubmit }: HederaAccountFormProps) {
  const { user, linkHederaAccount } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    privateKey: '',
    publicKey: '',
    networkType: 'testnet',
    keyType: 'ED25519'
  });
  
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.accountId || !formData.privateKey) {
        toast.error('Required fields missing', {
          description: 'Account ID and Private Key are required'
        });
        return;
      }
      
      // If custom onSubmit handler is provided, use that
      if (onSubmit) {
        await onSubmit(formData);
      } 
      // Otherwise use the default linkHederaAccount from context
      else if (user) {
        await linkHederaAccount(formData.accountId);
        toast.success('Hedera account linked successfully!');
      } else {
        throw new Error('User not authenticated');
      }
      
    } catch (error: any) {
      toast.error('Failed to link account', {
        description: error.message || 'Something went wrong'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconStyles = (fieldName: string) => {
    return `absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
      focused === fieldName ? 'text-primary' : 'text-muted-foreground'
    }`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
            <Key className="h-4 w-4 text-purple-600" />
          </div>
          <CardTitle className="text-xl">Link Your Hedera Account</CardTitle>
        </div>
        <CardDescription>
          Connect your Hedera account to start sending and receiving payments on Twitter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account ID */}
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium mb-1">
              Hedera Account ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className={getIconStyles('accountId')} />
              <Input
                id="accountId"
                value={formData.accountId}
                onChange={(e) => handleChange('accountId', e.target.value)}
                placeholder="0.0.12345"
                className="pl-10"
                required
                onFocus={() => setFocused('accountId')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>
          
          {/* Private Key */}
          <div>
            <label htmlFor="privateKey" className="block text-sm font-medium mb-1">
              Private Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Key className={getIconStyles('privateKey')} />
              <Input
                id="privateKey"
                type={showPrivateKey ? "text" : "password"}
                value={formData.privateKey}
                onChange={(e) => handleChange('privateKey', e.target.value)}
                placeholder="302e020100300506032b657..."
                className="pl-10 pr-10"
                required
                onFocus={() => setFocused('privateKey')}
                onBlur={() => setFocused(null)}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
              >
                {showPrivateKey ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-1 flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Your private key is encrypted before storage
            </p>
          </div>
          
          {/* Public Key (Optional) */}
          <div>
            <label htmlFor="publicKey" className="block text-sm font-medium mb-1">
              Public Key <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <Key className={getIconStyles('publicKey')} />
              <Input
                id="publicKey"
                value={formData.publicKey}
                onChange={(e) => handleChange('publicKey', e.target.value)}
                placeholder="0x424cc90352e7bfcf..."
                className="pl-10"
                onFocus={() => setFocused('publicKey')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>
          
          {/* Network Type */}
          <div>
            <label htmlFor="networkType" className="block text-sm font-medium mb-1">
              Network
            </label>
            <div className="relative">
              <Globe className={getIconStyles('networkType')} />
              <Select
                value={formData.networkType}
                onValueChange={(value) => handleChange('networkType', value)}
              >
                <SelectTrigger className="pl-10" id="networkType">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="previewnet">Previewnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Key Type */}
          <div>
            <label htmlFor="keyType" className="block text-sm font-medium mb-1">
              Key Type
            </label>
            <div className="relative">
              <Key className={getIconStyles('keyType')} />
              <Select
                value={formData.keyType}
                onValueChange={(value) => handleChange('keyType', value)}
              >
                <SelectTrigger className="pl-10" id="keyType">
                  <SelectValue placeholder="Select key type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ED25519">ED25519</SelectItem>
                  <SelectItem value="ECDSA">ECDSA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800"
              disabled={isSubmitting || !formData.accountId || !formData.privateKey}
            >
              {isSubmitting ? 'Linking Account...' : 'Link Hedera Account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 