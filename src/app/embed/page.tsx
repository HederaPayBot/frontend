import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HederaPayBot Commands',
  description: 'Quick reference for HederaPayBot Twitter commands',
  openGraph: {
    images: ['https://hederapaybot.netlify.app/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HederaPayBot Commands',
    description: 'Quick reference for HederaPayBot Twitter commands',
    images: ['https://hederapaybot.netlify.app/api/og'],
  },
};

export default function EmbedPage() {
  return (
    <main className="bg-gradient-to-br from-blue-950 via-purple-900 to-violet-900 text-white min-h-screen p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 pt-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full"></div>
          <h1 className="text-4xl md:text-5xl font-bold relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              HederaPayBot
            </span>
          </h1>
          <p className="text-lg opacity-90 italic mt-2">Your Hedera blockchain assistant on Twitter</p>
          
          <div className="flex items-center justify-center mt-4 space-x-1">
            <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-sm animate-pulse">@HederaPayBot</span>
            <span className="text-lg">+</span>
            <span className="inline-block px-3 py-1 bg-purple-600 text-white rounded-md text-sm">commands below</span>
            <span className="text-lg">=</span>
            <span className="inline-block px-3 py-1 bg-pink-600 text-white rounded-md text-sm">blockchain magic</span>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Start Card */}
          <div className="col-span-full bg-gradient-to-r from-blue-800/50 to-indigo-800/50 rounded-xl p-5 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
            <h2 className="text-2xl font-bold mb-3 flex items-center">
              <span className="text-2xl mr-2">🚀</span> Quick Start
            </h2>
            <div className="space-y-2">
              <p className="text-blue-200 font-medium">New to Hedera? Register first:</p>
              <div className="bg-blue-900/70 p-3 rounded-lg border border-blue-700 overflow-x-auto">
                <code className="text-sm md:text-base font-mono">@HederaPayBot register</code>
              </div>
            </div>
          </div>

          {/* Command Category Cards */}
          <CommandCard 
            title="Account & HBAR" 
            icon="💰"
            color="from-amber-700/40 to-amber-800/40"
            accentColor="amber-600"
            commands={[
              { cmd: "what's my HBAR balance?", desc: "Check your balance" },
              { cmd: "transfer 5 HBAR to @user", desc: "Send HBAR" },
              { cmd: "transfer 5 HBAR to 0.0.123", desc: "Send to account" }
            ]}
          />

          <CommandCard 
            title="Tokens" 
            icon="🪙"
            color="from-emerald-700/40 to-emerald-800/40"
            accentColor="emerald-600"
            commands={[
              { cmd: "show my token balances", desc: "Check your tokens" },
              { cmd: "create token MyToken with symbol MTK, 2 decimals, initial supply 1000", desc: "Create token" },
              { cmd: "mint 1000 tokens 0.0.123", desc: "Mint more tokens" }
            ]}
          />

          <CommandCard 
            title="Token Transfers" 
            icon="📤"
            color="from-purple-700/40 to-purple-800/40"
            accentColor="purple-600"
            commands={[
              { cmd: "transfer 10 of 0.0.123 to @user", desc: "Send tokens" },
              { cmd: "airdrop 10 MTK to @user1 @user2", desc: "Airdrop tokens" }
            ]}
          />

          <CommandCard 
            title="Token Management" 
            icon="🔗"
            color="from-sky-700/40 to-sky-800/40"
            accentColor="sky-600"
            commands={[
              { cmd: "associate my wallet with token 0.0.123", desc: "Add token" },
              { cmd: "dissociate my wallet from token 0.0.123", desc: "Remove token" },
              { cmd: "reject token 0.0.123", desc: "Reject airdrop" }
            ]}
          />

          <CommandCard 
            title="Topics" 
            icon="💬"
            color="from-rose-700/40 to-rose-800/40"
            accentColor="rose-600"
            commands={[
              { cmd: 'create topic with memo: "Project updates"', desc: "Create topic" },
              { cmd: 'submit "Weekly update" to topic 0.0.123', desc: "Send message" },
              { cmd: "get messages from topic 0.0.123", desc: "Read messages" }
            ]}
          />

          <CommandCard 
            title="Airdrops" 
            icon="🎁"
            color="from-fuchsia-700/40 to-fuchsia-800/40"
            accentColor="fuchsia-600"
            commands={[
              { cmd: "show pending airdrops", desc: "Check pending" },
              { cmd: "claim airdrop of token 0.0.123 from account 0.0.456", desc: "Claim airdrop" }
            ]}
          />

          {/* Help Card */}
          <div className="col-span-full mt-4 bg-gradient-to-r from-blue-800/40 to-violet-800/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center">
                  <span className="text-2xl mr-2">ℹ️</span> Need More Help?
                </h2>
                <p className="text-blue-200 mb-3">Type <code className="bg-blue-900/60 px-2 py-1 rounded">@HederaPayBot help</code> on Twitter</p>
              </div>
              <div className="mt-3 sm:mt-0">
                <a 
                  href="/help" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-violet-500 transition-all"
                >
                  View Full Documentation
                </a>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm opacity-80 pb-6">
          <p className="mb-1">Always mention <span className="font-semibold text-blue-300">@HederaPayBot</span> before commands</p>
          <p className="text-blue-300/70">
            <a href="https://github.com/yourrepository" className="hover:text-blue-300 transition-colors">GitHub</a> • 
            <a href="/help" className="hover:text-blue-300 transition-colors ml-3">Documentation</a>
          </p>
        </footer>
      </div>
    </main>
  );
}

// Command Card Component
function CommandCard({ 
  title, 
  icon, 
  color, 
  accentColor,
  commands 
}: { 
  title: string; 
  icon: string; 
  color: string;
  accentColor: string;
  commands: { cmd: string; desc: string }[] 
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-5 shadow-lg relative overflow-hidden`}>
      <div className={`absolute -top-10 -right-10 w-24 h-24 bg-${accentColor}/20 rounded-full blur-2xl`}></div>
      <h2 className="text-xl font-bold mb-3 flex items-center">
        <span className="text-2xl mr-2">{icon}</span> {title}
      </h2>
      <ul className="space-y-2">
        {commands.map((cmd, idx) => (
          <li key={idx} className={`bg-${accentColor}/10 p-2 rounded-md border border-${accentColor}/40 text-sm`}>
            <p className="font-mono mb-1 text-white/90 truncate overflow-x-auto whitespace-nowrap pb-1">
              @HederaPayBot {cmd.cmd}
            </p>
            <p className="text-xs text-blue-100/80">{cmd.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
} 