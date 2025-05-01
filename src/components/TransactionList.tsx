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
import { formatDate, formatDistanceToNow } from "@/utils/formatting";
import { ExternalLink, Copy, RefreshCw, ArrowDown, ArrowUp, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Transaction } from '@/utils/api';
import { cn } from '@/lib/utils';

type TransactionFilter = 'all' | 'sent' | 'received';

interface TransactionListProps {
  transactions?: Transaction[];
  className?: string;
  localLoading?: boolean;
}

// Helper to format token ID for display
const formatTokenId = (tokenId: string): string => {
  if (tokenId === 'HBAR') return 'HBAR';
  // Extract the last segment from the tokenId (e.g., '0.0.1234' -> '1234')
  const parts = tokenId.split('.');
  return parts[parts.length - 1];
};

// Group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]) => {
  const grouped = transactions.reduce((acc, tx) => {
    // Format as YYYY-MM-DD to group by day
    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
  
  // Convert to sorted array of groups
  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    .map(([date, txs]) => ({
      date,
      transactions: txs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }));
};

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
  
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'success') {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (statusLower === 'failed' || statusLower === 'failure') {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>;
      case 'failed':
      case 'failure':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Failed
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>;
    }
  };
  
  const filteredTransactions = allTransactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.senderUsername === user.twitterUsername;
    if (filter === 'received') return tx.recipientUsername === user.twitterUsername;
    return true;
  });
  
  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  
  const loading = isLoading || isRefreshing || localLoading;
  const isLinked = !!user.hederaAccountId;

  // Mobile card view for a transaction
  const TransactionCard = ({ tx }: { tx: Transaction }) => {
    const isSender = tx.senderUsername === user.twitterUsername;
    const txType = isSender ? 'Sent' : 'Received';
    const otherUser = isSender ? tx.recipientUsername : tx.senderUsername;
    const formattedTime = formatDistanceToNow(new Date(tx.timestamp));
    
    return (
      <div 
        className="mb-3 p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => handleViewDetails(tx)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full mr-3",
              isSender ? "bg-red-100" : "bg-green-100"
            )}>
              {isSender ? 
                <ArrowUp className="h-4 w-4 text-red-600" /> : 
                <ArrowDown className="h-4 w-4 text-green-600" />
              }
            </div>
            <div>
              <div className={cn(
                "font-medium",
                isSender ? "text-red-600" : "text-green-600"
              )}>
                {txType}
              </div>
              <div className="text-xs text-gray-500">
                {formattedTime}
              </div>
            </div>
          </div>
          <div>
            {getStatusBadge(tx.status)}
          </div>
        </div>
        
        <div className="mb-2 flex justify-between">
          <div className="text-sm text-gray-500">
            {isSender ? 'To' : 'From'}: <span className="font-medium text-gray-700">@{otherUser}</span>
          </div>
          <div className="text-sm font-medium">
            {isSender ? '-' : '+'}{tx.amount} <span className="text-xs text-gray-500">{formatTokenId(tx.tokenId)}</span>
          </div>
        </div>
        
        {tx.memo && (
          <div className="text-xs text-gray-500 mt-2 italic border-t pt-2 truncate">
            "{tx.memo}"
          </div>
        )}
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
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">No transactions yet</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Your transaction history will appear here once you start sending or receiving HBAR or tokens.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile View (card-based with date grouping) */}
              <div className="block sm:hidden">
                {groupedTransactions.map((group) => (
                  <div key={group.date} className="mb-5">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">
                      {new Date(group.date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    {group.transactions.map((tx) => (
                      <TransactionCard key={tx.transactionId} tx={tx} />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Tablet/Desktop View (table-based) */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Time</TableHead>
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
                            <div className="flex items-center">
                              <div className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full mr-2",
                                isSender ? "bg-red-100" : "bg-green-100"
                              )}>
                                {isSender ? 
                                  <ArrowUp className="h-3 w-3 text-red-600" /> : 
                                  <ArrowDown className="h-3 w-3 text-green-600" />
                                }
                              </div>
                              <span className={isSender ? 'text-red-600' : 'text-green-600'}>
                                {txType}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-medium">@{otherUser}</span>
                              {tx.memo && (
                                <span className="ml-2 text-xs text-gray-500 italic max-w-[150px] truncate">
                                  "{tx.memo}"
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center font-medium">
                              <span className="mr-1">{isSender ? '-' : '+'}{tx.amount}</span>
                              <span className="text-xs text-gray-500">{formatTokenId(tx.tokenId)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(tx.timestamp))}</span>
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
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {transactionDetails.senderUsername === user.twitterUsername ? (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                        <ArrowUp className="h-4 w-4 text-red-600" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                        <ArrowDown className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <div>
                      <div className={transactionDetails.senderUsername === user.twitterUsername ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {transactionDetails.senderUsername === user.twitterUsername ? 'Sent' : 'Received'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transactionDetails.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(transactionDetails.status)}
                    <span className="ml-1 text-sm font-medium">
                      {transactionDetails.status.charAt(0).toUpperCase() + transactionDetails.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="text-center py-3">
                  <div className="text-3xl font-bold">
                    {transactionDetails.amount} <span className="text-lg text-gray-500">{formatTokenId(transactionDetails.tokenId)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="text-sm font-medium">@{transactionDetails.senderUsername}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="text-sm font-medium">@{transactionDetails.recipientUsername}</p>
                </div>
                {transactionDetails.memo && (
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Memo</p>
                    <p className="text-sm break-words max-w-[200px] text-right">{transactionDetails.memo}</p>
                  </div>
                )}
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