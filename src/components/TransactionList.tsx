import { useEffect, useState, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/formatting";
import { ExternalLink, Copy, RefreshCw, ArrowDown, ArrowUp } from "lucide-react";
import { Transaction } from '@/utils/api';

type TransactionFilter = 'all' | 'sent' | 'received';

interface TransactionListProps {
  transactions?: Transaction[];
  className?: string;
  localLoading?: boolean;
}

export function TransactionList({ transactions: propTransactions, className, localLoading }: TransactionListProps) {
  const { user, transactions: contextTransactions, refreshTransactions, isLoading } = useApp();
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use provided transactions from props if available, otherwise use from context
  const allTransactions = propTransactions || contextTransactions || [];
  
  // Use a ref to track if we've already fetched transactions
  const hasLoadedTransactions = useRef(false);

  // Load transactions when component mounts - with improved dependency handling
  useEffect(() => {
    // Only fetch transactions if:
    // 1. We have a user with a Twitter username
    // 2. No transactions were provided via props
    // 3. We haven't already loaded transactions 
    // 4. Not currently loading
    if (user?.twitterUsername && !propTransactions && !hasLoadedTransactions.current && !isLoading && !isRefreshing && !localLoading) {
      loadTransactions();
      hasLoadedTransactions.current = true;
    }
    
    // Reset the ref when user changes
    return () => {
      if (!user?.twitterUsername) {
        hasLoadedTransactions.current = false;
      }
    };
  }, [user?.twitterUsername, propTransactions, isLoading, localLoading]);

  const loadTransactions = async () => {
    if (!user?.twitterUsername || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshTransactions = () => {
    // Reset the ref so we can load again
    hasLoadedTransactions.current = false;
    loadTransactions();
  };

  const handleViewDetails = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setDetailsOpen(true);
    setTransactionDetails(tx);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };
  
  if (!user) {
    return null;
  }
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'text-green-600';
      case 'failed':
      case 'failure':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'failed':
      case 'failure':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };
  
  const filteredTransactions = allTransactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.senderUsername === user.twitterUsername;
    if (filter === 'received') return tx.recipientUsername === user.twitterUsername;
    return true;
  });
  
  const loading = isLoading || isRefreshing || localLoading;
  const isLinked = !!user.hederaAccountId;

  // Mobile card view for a transaction
  const TransactionCard = ({ tx }: { tx: Transaction }) => {
    const isSender = tx.senderUsername === user.twitterUsername;
    const txType = isSender ? 'Sent' : 'Received';
    const otherUser = isSender ? tx.recipientUsername : tx.senderUsername;
    
    return (
      <div 
        className="mb-3 p-3 border rounded-md shadow-sm bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => handleViewDetails(tx)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {isSender ? 
              <ArrowUp className="h-4 w-4 text-red-500 mr-1" /> : 
              <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
            }
            <span className={`font-medium ${isSender ? 'text-red-600' : 'text-green-600'}`}>
              {txType}
            </span>
          </div>
          <div>
            {getStatusBadge(tx.status)}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="text-sm text-gray-500">
            {isSender ? 'To' : 'From'}: <span className="font-medium text-gray-700">@{otherUser}</span>
          </div>
          <div className="text-sm text-gray-500">
            Amount: <span className="font-medium text-gray-700">{tx.amount} {tx.tokenId.split('.').pop()}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          {formatDate(tx.timestamp)}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className={`w-full ${className || ''}`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">Transaction History</CardTitle>
            {isLinked && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-2"
                onClick={handleRefreshTransactions}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            )}
          </div>
          <div className="flex space-x-1">
            <Button 
              onClick={() => setFilter('all')} 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              className={`px-2 sm:px-3 ${filter === 'all' ? 'bg-[#8247E5] hover:bg-[#7038d6]' : ''}`}
            >
              All
            </Button>
            <Button 
              onClick={() => setFilter('sent')} 
              variant={filter === 'sent' ? 'default' : 'outline'} 
              size="sm"
              className={`px-2 sm:px-3 ${filter === 'sent' ? 'bg-[#8247E5] hover:bg-[#7038d6]' : ''}`}
            >
              Sent
            </Button>
            <Button 
              onClick={() => setFilter('received')} 
              variant={filter === 'received' ? 'default' : 'outline'} 
              size="sm"
              className={`px-2 sm:px-3 ${filter === 'received' ? 'bg-[#8247E5] hover:bg-[#7038d6]' : ''}`}
            >
              Received
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8247E5] mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <>
              {/* Mobile View (card-based) */}
              <div className="block sm:hidden">
                {filteredTransactions.map((tx) => (
                  <TransactionCard key={tx.transactionId} tx={tx} />
                ))}
              </div>
              
              {/* Tablet/Desktop View (table-based) */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => {
                      const isSender = tx.senderUsername === user.twitterUsername;
                      const txType = isSender ? 'Sent' : 'Received';
                      const otherUser = isSender ? tx.recipientUsername : tx.senderUsername;
                      
                      return (
                        <TableRow key={tx.transactionId} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(tx)}>
                          <TableCell className="font-medium">
                            <span className={isSender ? 'text-yellow-600' : 'text-green-600'}>
                              {txType}
                            </span>
                          </TableCell>
                          <TableCell>@{otherUser}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-1">{tx.amount}</span>
                              <span className="text-xs text-muted-foreground">{tx.tokenId.split('.').pop()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge(tx.status)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Details for transaction on {transactionDetails && formatDate(transactionDetails.timestamp)}
            </DialogDescription>
          </DialogHeader>
          
          {transactionDetails && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-500">Transaction Type</p>
                <p className="text-sm">
                  {transactionDetails.senderUsername === user.twitterUsername ? 'Sent' : 'Received'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="text-sm">@{transactionDetails.senderUsername}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="text-sm">@{transactionDetails.recipientUsername}</p>
                </div>
                {transactionDetails.memo && (
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Memo</p>
                    <p className="text-sm break-words max-w-[200px] text-right">{transactionDetails.memo}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm font-mono">
                    {transactionDetails.amount} {transactionDetails.tokenId.split('.').pop()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`text-sm ${getStatusColor(transactionDetails.status)}`}>
                    {transactionDetails.status.charAt(0).toUpperCase() + transactionDetails.status.slice(1)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-sm">{formatDate(transactionDetails.timestamp)}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => copyToClipboard(transactionDetails.transactionId)}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy Transaction ID</span>
                    </Button>
                    {transactionDetails.hashscanUrl && (
                      <a 
                        href={transactionDetails.hashscanUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View on HashScan</span>
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs font-mono mt-1 text-muted-foreground break-all">
                  {transactionDetails.transactionId}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 