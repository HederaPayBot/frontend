'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccountDisplay } from '@/components/AccountDisplay';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Bell, Shield, UserCog, Key, Network, Wallet, Bot } from 'lucide-react';

export default function Settings() {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const { user, isLoading, isLinked, refreshUserProfile } = useApp();
  const [networkType, setNetworkType] = useState<'mainnet' | 'testnet'>('testnet');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // Refresh user profile
  useEffect(() => {
    const loadProfileData = async () => {
      if (authenticated && user?.twitterUsername) {
        try {
          // Refresh user profile data
          await refreshUserProfile();
        } catch (error) {
          console.error("Failed to refresh profile:", error);
        } finally {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };

    loadProfileData();
  }, [authenticated, user?.twitterUsername, refreshUserProfile]);

  // Loading state
  if (!ready || isLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8247E5]"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Title */}
          <div className="mb-8 flex items-center">
            <SettingsIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Hedera Account Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <UserCog className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>Hedera Account</CardTitle>
                  <CardDescription>
                    Manage your Hedera account connection
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <AccountDisplay showLinkForm={true} />
                
                {isLinked && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-500">Account Status</Label>
                        <div>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-500">Network</Label>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-yellow-500">{networkType}</Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => setNetworkType(networkType === 'testnet' ? 'mainnet' : 'testnet')}
                          >
                            Toggle Network
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium text-sm mb-2">Advanced Options</h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                          <Key className="h-4 w-4 mr-2" />
                          <span>Manage Keys</span>
                          <Badge className="ml-auto bg-yellow-100 text-yellow-800">Coming Soon</Badge>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                          <Wallet className="h-4 w-4 mr-2" />
                          <span>Export Wallet</span>
                          <Badge className="ml-auto bg-yellow-100 text-yellow-800">Coming Soon</Badge>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Notification Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Control how you receive notifications
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for payments
                      </p>
                    </div>
                    <Switch id="email-notifications" disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="payment-confirmations">Payment Confirmations</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Confirm before sending payments
                      </p>
                    </div>
                    <Switch id="payment-confirmations" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="eliza-notifications">Eliza AI Assistant</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Allow AI assistant to send notifications
                      </p>
                    </div>
                    <Switch id="eliza-notifications" defaultChecked disabled={!isLinked} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>AI Assistant Settings</CardTitle>
                  <CardDescription>
                    Manage your Eliza AI assistant preferences
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {!isLinked ? (
                  <div className="p-4 text-center bg-gray-50 border rounded-md">
                    <p className="text-gray-600 mb-2">Link your Hedera account to configure AI assistant settings</p>
                    <AccountDisplay showLinkForm={true} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enable-eliza">Enable AI Assistant</Label>
                        <p className="text-sm text-gray-500">
                          Allow Eliza to respond to your commands
                        </p>
                      </div>
                      <Switch id="enable-eliza" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enable-suggestions">Smart Suggestions</Label>
                        <p className="text-sm text-gray-500">
                          Get AI-powered suggestions for payments
                        </p>
                      </div>
                      <Switch id="enable-suggestions" defaultChecked />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security & Account */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>Security & Account</CardTitle>
                  <CardDescription>
                    Manage your account security
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 