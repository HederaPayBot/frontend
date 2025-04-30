import { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/context/AppContext";
import { paymentAPI } from '@/utils/api';
import { TokenSelector } from "@/components/TokenSelector";

interface PaymentStatus {
  success?: boolean;
  message?: string;
  txId?: string;
}

interface PaymentFormProps {
  onSubmit?: (data: {recipient: string, amount: number, tokenType: string}) => void;
}

export function PaymentForm({ onSubmit }: PaymentFormProps) {
  const { user, isLinked, refreshTransactions } = useApp();
  
  const [paymentDetails, setPaymentDetails] = useState({
    recipient: '',
    amount: '',
    tokenType: 'HBAR',
  });
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.twitterUsername || !paymentDetails.recipient || !paymentDetails.amount) return;
    
    try {
      setIsSubmitting(true);
      setPaymentStatus({ message: 'Processing payment...' });
      
      const amount = parseFloat(paymentDetails.amount);
      if (isNaN(amount) || amount <= 0) {
        setPaymentStatus({ 
          success: false, 
          message: 'Please enter a valid amount greater than 0' 
        });
        setIsSubmitting(false);
        
        toast.error("Invalid amount", {
          description: "Please enter a valid amount greater than 0"
        });
        return;
      }
      
      // Direct API call to create the payment
      const response = await paymentAPI.createPayment(
        user.twitterUsername,
        paymentDetails.recipient,
        amount,
        paymentDetails.tokenType
      );
      
      setPaymentStatus({
        success: true,
        message: 'Payment sent successfully!',
        txId: response.transactionId
      });
      
      // Show success toast
      toast.success("Payment sent!", {
        description: `You sent ${amount} ${paymentDetails.tokenType} to @${paymentDetails.recipient}`,
        action: {
          label: "View TX",
          onClick: () => window.open(`https://hashscan.io/testnet/transaction/${response.transactionId}`, '_blank')
        }
      });
      
      // Reset form
      setPaymentDetails({
        recipient: '',
        amount: '',
        tokenType: 'HBAR',
      });
      
      // Refresh transaction history
      await refreshTransactions();
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit({
          recipient: paymentDetails.recipient,
          amount,
          tokenType: paymentDetails.tokenType
        });
      }
      
    } catch (error: any) {
      setPaymentStatus({
        success: false,
        message: error.message || 'Payment failed. Please try again.'
      });
      
      toast.error("Payment failed", {
        description: error.message || 'Payment failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Send Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {!isLinked ? (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-700 text-xs sm:text-sm">
              Please link your Hedera account to send payments.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handlePayment} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="recipient" className="text-xs sm:text-sm font-medium mb-1 block">
                Recipient Twitter Username
              </label>
              <Input
                id="recipient"
                placeholder="user123 (without @)"
                value={paymentDetails.recipient}
                onChange={(e) => setPaymentDetails({...paymentDetails, recipient: e.target.value})}
                className="w-full text-sm"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label htmlFor="amount" className="text-xs sm:text-sm font-medium mb-1 block">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0.000001"
                  step="0.000001"
                  value={paymentDetails.amount}
                  onChange={(e) => setPaymentDetails({...paymentDetails, amount: e.target.value})}
                  className="w-full text-sm"
                  required
                />
              </div>
              <div>
                <TokenSelector 
                  value={paymentDetails.tokenType}
                  onChange={(value) => setPaymentDetails({...paymentDetails, tokenType: value})}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#8247E5] hover:bg-[#7038d6] text-sm font-medium mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Send Payment'}
            </Button>
          </form>
        )}
        
        {/* Payment Status - keeping for backwards compatibility but using toasts for new alerts */}
        {paymentStatus && paymentStatus.success === false && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription className="text-xs sm:text-sm">
              {paymentStatus.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 