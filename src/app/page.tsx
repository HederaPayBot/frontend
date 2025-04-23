'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function Home() {
  const { login, authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hedera Twitter Pay</h1>
          </div>

          {authenticated ? (
            <div className="flex space-x-3">
              <Link href="/dashboard">
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">
                  Profile
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline">
                  Transactions
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              onClick={login}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Login with Twitter
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-4">
                Send Crypto Payments with a Simple Tweet
              </h2>
              <p className="text-xl mb-8">
                Just mention our bot and type a simple command to send HBAR to anyone on Twitter. 
                Fast, secure, and powered by Hedera.
              </p>
              {authenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-white text-purple-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg shadow-md">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={login}
                  className="bg-white text-purple-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg shadow-md"
                >
                  Get Started
                </Button>
              )}
            </div>
            <div className="hidden md:block">
              {/* Replace with your own illustration/image */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="border border-gray-300 rounded p-3 bg-gray-50">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                    <p className="font-medium text-gray-800">@user123</p>
                  </div>
                  <p className="text-gray-700 mb-2">
                    @hedera_pay send 5 HBAR to @friend456 for lunch yesterday
                  </p>
                  <div className="bg-purple-100 text-purple-800 p-2 rounded">
                    ✓ Payment sent! Transaction ID: 0.0.123456@789012
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect your account</h3>
              <p className="text-gray-600">
                Link your Twitter and Hedera accounts in our secure dashboard.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Send a command</h3>
              <p className="text-gray-600">
                Tweet a payment instruction mentioning our bot and the recipient.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment processed</h3>
              <p className="text-gray-600">
                We securely process the payment on the Hedera network and confirm it for you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Hedera Twitter Pay</h3>
              <p className="text-gray-400">Powered by Hedera Hashgraph</p>
            </div>
            <div>
              <p>&copy; {new Date().getFullYear()} Hedera Twitter Pay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
