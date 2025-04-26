import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  otherParty: string;
  amount: number;
  tokenSymbol: string;
  timestamp: Date;
}

interface SimpleTransactionListProps {
  transactions: Transaction[];
}

export function SimpleTransactionList({ transactions }: SimpleTransactionListProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {tx.type === 'sent' ? `Sent to @${tx.otherParty}` : `Received from @${tx.otherParty}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeAgo(tx.timestamp)}
                  </div>
                </div>
                <div className="font-mono font-medium">
                  {tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.tokenSymbol}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
} 