import React from 'react';
import { Metadata } from 'next';
import { QRCodeCard } from '@/components/QRCodeCard';

export const metadata: Metadata = {
  title: 'HederaPayBot - Command Reference',
  description: 'Complete command reference for HederaPayBot - Your Hedera blockchain assistant on Twitter',
  openGraph: {
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HederaPayBot - Command Reference',
    description: 'Complete command reference for HederaPayBot - Your Hedera blockchain assistant on Twitter',
    images: ['/api/og'],
  },
};

export default function HelpPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">HederaPayBot Command Reference</h1>
          <p className="mt-2 text-xl text-muted-foreground">Your Hedera blockchain assistant on Twitter</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <QRCodeCard 
            url="/embed" 
            title="Embeddable Commands" 
            description="Scan to view a compact version perfect for sharing on Twitter"
          />
          <QRCodeCard 
            url="/help" 
            title="Full Documentation" 
            description="Scan to view this complete command reference"
          />
        </div>

        <div className="grid gap-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Getting Started</h2>
            <p>Mention @HederaPayBot in your tweets followed by any of the commands below to interact with the Hedera network directly from Twitter.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm">
              <p className="font-semibold text-yellow-800">New to Hedera?</p>
              <p className="text-yellow-700 mt-1">Register first to get your Hedera account by tweeting:</p>
              <p className="font-mono bg-yellow-100 p-2 rounded mt-1">@HederaPayBot register</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Account Commands</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Command</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-left py-2 px-4">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Register</td>
                    <td className="py-2 px-4">Register to create a new Hedera account</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot register</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Check balance</td>
                    <td className="py-2 px-4">Check HBAR balance of your account</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot what's my HBAR balance?</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Transfer HBAR</td>
                    <td className="py-2 px-4">Transfer HBAR to another account or Twitter user</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot transfer 5 HBAR to 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono"></td>
                    <td className="py-2 px-4">Alternative format for Twitter users</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot send @username 5 HBAR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Token Commands</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Command</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-left py-2 px-4">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Check token balance</td>
                    <td className="py-2 px-4">Check all your token balances</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot show my token balances</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Check specific token</td>
                    <td className="py-2 px-4">Check balance of a specific token</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot show balance of token 0.0.1234567 for wallet 0.0.7654321</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Token holders</td>
                    <td className="py-2 px-4">List all holders of a token</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot show token holders for 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Token holders min</td>
                    <td className="py-2 px-4">Holders with minimum balance</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot show token holders for 0.0.1234567 with minimum balance 100</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Create token</td>
                    <td className="py-2 px-4">Create a new fungible token</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot create token MyToken with symbol MTK, 2 decimals, initial supply 1000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Create token (advanced)</td>
                    <td className="py-2 px-4">Create token with keys</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot create token MyToken with symbol MTK, 2 decimals, initial supply 1000. Add supply key, admin key</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Mint token</td>
                    <td className="py-2 px-4">Mint more of existing token</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot mint 1000 tokens 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Mint NFT</td>
                    <td className="py-2 px-4">Mint an NFT with metadata</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot mint NFT 0.0.1234567 with metadata "My NFT metadata"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Token Transfer & Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Command</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-left py-2 px-4">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Transfer token</td>
                    <td className="py-2 px-4">Transfer tokens to an account</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot transfer 10 of 0.0.1234567 to 0.0.7654321</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Transfer to Twitter user</td>
                    <td className="py-2 px-4">Transfer tokens to Twitter user</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot send @username 10 MTK</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Airdrop token</td>
                    <td className="py-2 px-4">Airdrop tokens to multiple accounts</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot airdrop 10 MTK to @user1 @user2 @user3</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Associate token</td>
                    <td className="py-2 px-4">Associate a token with your account</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot associate my wallet with token 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Dissociate token</td>
                    <td className="py-2 px-4">Dissociate a token from your account</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot dissociate my wallet from token 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Reject token</td>
                    <td className="py-2 px-4">Reject an unwanted token</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot reject token 0.0.1234567</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Airdrop Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Command</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-left py-2 px-4">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Pending airdrops</td>
                    <td className="py-2 px-4">Check your pending airdrops</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot show pending airdrops</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Claim airdrop</td>
                    <td className="py-2 px-4">Claim an airdropped token</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot claim airdrop of token 0.0.1234567 from account 0.0.7654321</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Topic Commands</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Command</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-left py-2 px-4">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Create topic</td>
                    <td className="py-2 px-4">Create a new topic</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot create topic with memo: "Project updates"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Create topic with key</td>
                    <td className="py-2 px-4">Create a topic with submit key</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot create topic with memo: "Project updates". Set submit key</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Get topic info</td>
                    <td className="py-2 px-4">Get information about a topic</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot show details for topic 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Submit message</td>
                    <td className="py-2 px-4">Submit message to a topic</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot submit "Weekly update" to topic 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Get messages</td>
                    <td className="py-2 px-4">Get all messages from a topic</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot get messages from topic 0.0.1234567</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Get messages (filtered)</td>
                    <td className="py-2 px-4">Get messages within a time range</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot get messages from topic 0.0.1234567 that were posted after 2023-01-01 and before 2023-02-01</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">Delete topic</td>
                    <td className="py-2 px-4">Delete a topic</td>
                    <td className="py-2 px-4 font-mono">@HederaPayBot delete topic 0.0.1234567</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Command Tips</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
              <div>
                <p className="font-semibold text-blue-800">Alternative Command Formats</p>
                <p className="text-blue-700 mt-1">Most commands can be written in multiple ways. For example:</p>
                <ul className="list-disc list-inside mt-1 text-blue-700 space-y-1">
                  <li><span className="font-mono bg-blue-100 p-1 rounded">@HederaPayBot What's my balance?</span> or <span className="font-mono bg-blue-100 p-1 rounded">@HederaPayBot show my balance</span></li>
                  <li><span className="font-mono bg-blue-100 p-1 rounded">@HederaPayBot Send 5 HBAR to @username</span> or <span className="font-mono bg-blue-100 p-1 rounded">@HederaPayBot Transfer 5 HBAR to @username</span></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-800">Common Errors</p>
                <ul className="list-disc list-inside mt-1 text-blue-700 space-y-1">
                  <li>Make sure to register before using any commands</li>
                  <li>For token IDs, always use the format 0.0.XXXXX</li>
                  <li>When mentioning Twitter usernames, include the @ symbol</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Get Help</h2>
            <p>
              If you need help with any commands, simply tweet:
              <span className="font-mono bg-gray-100 p-1 rounded ml-2">@HederaPayBot help</span>
            </p>
            <p>
              For detailed examples and more information, visit our
              <a href="https://github.com/yourrepository" className="text-blue-600 hover:underline"> GitHub repository</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
} 