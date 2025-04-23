'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionList } from '@/components/TransactionList';

export default function Transactions() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user, transactions, refreshTransactions, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // Load transactions on mount
  useEffect(() => {
    if (authenticated && user) {
      refreshTransactions();
    }
  }, [authenticated, user, refreshTransactions]);

  // Loading state
  if (!ready || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8247E5]"></div>
      </div>
    );
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.hederaTransactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <div className="flex space-x-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => router.push('/profile')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Your Transactions</CardTitle>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by recipient or transaction ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <Button 
                  onClick={() => refreshTransactions()}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <TransactionList transactions={filteredTransactions} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found matching your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 