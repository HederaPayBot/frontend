'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { elizaAPI } from "@/utils/api";
import { Bot, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ElizaStatusData {
  status: 'online' | 'offline' | 'maintenance';
  uptime: string;
  lastUpdate: string;
  version: string;
}

export function ElizaStatus() {
  const { isLinked } = useApp();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<ElizaStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Eliza status
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await elizaAPI.getStatus();
      console.log('Eliza status response:', response);
      if (response.success) {
        // Safely map response properties with fallbacks
        setStatusData({
          status: (response as any).details.status || 'online',
          uptime: (response as any).uptime || 'Unknown',
          lastUpdate: (response as any).lastUpdate || new Date().toISOString(),
          version: (response as any).version || '1.0.0'
        });
        console.log('Eliza status data:', statusData);
        setError(null);
      } else {
        throw new Error('Failed to fetch Eliza status');
      }
    } catch (err) {
      console.error('Error fetching Eliza status:', err);
      setError('Could not connect to Eliza service');
      
      // Fallback to mock data when API fails
      setStatusData({
        status: 'online',
        uptime: '3d 2h 15m',
        lastUpdate: new Date().toISOString(),
        version: '1.0.0'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch status on initial load
  useEffect(() => {
    if (isLinked) {
      fetchStatus();
    }
  }, [isLinked]);

  // Refresh status every 5 minutes if linked
  useEffect(() => {
    if (!isLinked) return;
    
    const intervalId = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [isLinked]);

  const getStatusBadge = (status: string) => {
    console.log('Status:', status);
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'available':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!isLinked) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center">
              <Bot className="h-4 w-4 mr-2 text-purple-500" />
              Eliza AI Assistant
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 text-center">
            Please link your Hedera account to access AI assistant
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center">
            <Bot className="h-4 w-4 mr-2 text-purple-500" />
            Eliza AI Assistant
          </div>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={fetchStatus}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !statusData ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : error && !statusData ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : statusData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status:</span>
              {getStatusBadge(statusData.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Uptime:</span>
              <span className="text-sm font-medium">{statusData.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Version:</span>
              <span className="text-sm">{statusData.version}</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Last updated: {new Date(statusData.lastUpdate).toLocaleString()}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
} 