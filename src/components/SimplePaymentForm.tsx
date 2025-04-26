import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SimplePaymentFormProps {
  onSend: (recipient: string, amount: number, token: string) => void;
  availableTokens?: string[];
}

export function SimplePaymentForm({ 
  onSend, 
  availableTokens = ['SOL', 'HBAR', 'USDC'] 
}: SimplePaymentFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(availableTokens[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount || isNaN(parseFloat(amount))) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Process payment
    try {
      onSend(recipient, parseFloat(amount), token);
      
      // Reset form
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-4">Send</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Twitter Handle
            </label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="@johndoe"
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount
            </label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,5"
              inputMode="decimal"
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Token
            </label>
            <Select
              value={token}
              onValueChange={setToken}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 