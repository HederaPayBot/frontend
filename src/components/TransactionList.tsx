import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/formatting";

type TransactionFilter = 'all' | 'sent' | 'received';

interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  tokenType: string;
  status: 'pending' | 'completed' | 'failed';
  hederaTransactionId?: string;
  timestamp: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
}

export function TransactionList({ transactions: propTransactions }: TransactionListProps = {}) {
  const { user, transactions: contextTransactions, refreshTransactions, isLoading } = useApp();
  const [filter, setFilter] = useState<TransactionFilter>('all');
  
  // Use provided transactions from props if available, otherwise use from context
  const allTransactions = propTransactions || contextTransactions;
  
  useEffect(() => {
    if (user && !propTransactions) {
      refreshTransactions();
    }
  }, [user, propTransactions]);
  
  if (!user) {
    return null;
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };
  
  const filteredTransactions = allTransactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.sender === user.twitterUsername;
    if (filter === 'received') return tx.recipient === user.twitterUsername;
    return true;
  });
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Transaction History</CardTitle>
        <div className="flex space-x-1">
          <Button 
            onClick={() => setFilter('all')} 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'all' ? 'bg-[#8247E5] hover:bg-[#7038d6]' : ''}
          >
            All
          </Button>
          <Button 
            onClick={() => setFilter('sent')} 
            variant={filter === 'sent' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'sent' ? 'bg-[#8247E5] hover:bg-[#7038d6]' : ''}
          >
            Sent
          </Button>
          <Button 
            onClick={() => setFilter('received')} 
            variant={filter === 'received' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'received' ? 'bg-[#8247E5] hover:bg-[#7038d6]' : ''}
          >
            Received
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-center text-sm text-muted-foreground">Loading transactions...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => {
                  const isSender = tx.sender === user.twitterUsername;
                  const txType = isSender ? 'Sent' : 'Received';
                  const otherUser = isSender ? tx.recipient : tx.sender;
                  
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {formatDate(tx.timestamp)}
                      </TableCell>
                      <TableCell>{txType}</TableCell>
                      <TableCell>@{otherUser}</TableCell>
                      <TableCell>
                        <span className={isSender ? 'text-red-600' : 'text-green-600'}>
                          {isSender ? '-' : '+'}{tx.amount} {tx.tokenType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusColor(tx.status)}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 