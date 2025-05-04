'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { HeroCommandDemo } from "@/components/HeroCommandDemo";
import { useState, useEffect, useRef } from 'react';

// Detect screen size and set proper classes/styles
const useResponsiveStyles = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial values
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, screenWidth };
};

export default function Home() {
  const { login, authenticated, ready } = usePrivy();
  const [widgetView, setWidgetView] = useState<'web' | 'twitter'>('web');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const widgetSectionRef = useRef<HTMLDivElement>(null);
  const widgetIframeRef = useRef<HTMLIFrameElement>(null);
  const { isMobile, screenWidth } = useResponsiveStyles();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('#mobile-menu') && !target.closest('#menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent auto-scrolling to widget section
  useEffect(() => {
    // Disable any scroll position restoration that might be happening
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual';
    }
    
    // Set initial scroll position to top
    window.scrollTo(0, 0);
  }, []);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  // Handle copy embed code
  const copyEmbedCode = () => {
    const embedCode = widgetView === 'web'
      ? '<iframe src="/embed-widget" width="400" height="500" style="border:none;" title="HederaPayBot"></iframe>'
      : '<iframe src="/embed-widget?twitter=true" width="350" height="450" style="border:none;" title="HederaPayBot"></iframe>';
    
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        setIsCopied(true);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Handle widget interaction
  const toggleWidgetInteraction = () => {
    setIsInteracting(!isInteracting);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Widget dimensions based on platform and screen size
  const widgetDimensions = {
    web: {
      width: isMobile ? '100%' : '400px',
      height: isMobile ? '450px' : '500px',
      maxWidth: '100%',
    },
    twitter: {
      width: isMobile ? '100%' : '350px',
      height: isMobile ? '400px' : '450px',
      maxWidth: '100%',
    }
  };

  // Platform-specific styling
  const platformStyles = {
    web: {
      container: "bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg shadow-md",
      header: "bg-purple-600 text-white",
      label: "Website Embed"
    },
    twitter: {
      container: "bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg shadow-md",
      header: "bg-blue-500 text-white",
      label: "Twitter Embed"
    }
  };

  // Toggle between web and Twitter views with animation
  const toggleView = (view: 'web' | 'twitter') => {
    if (view === widgetView || isAnimating) return;
    
    setIsAnimating(true);
    setWidgetView(view);
    setIsInteracting(false);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow relative z-20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hedera Twitter Pay</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 mr-4">
              <Link href="/help" className="text-gray-600 hover:text-purple-600">
                Commands
              </Link>
              <Link href="/embed-widget" className="text-gray-600 hover:text-purple-600">
                Widget
              </Link>
              <Link href="/embed" className="text-gray-600 hover:text-purple-600">
                Embed Link
              </Link>
            </div>

            {/* Desktop Authentication Buttons */}
            <div className="hidden md:block">
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              {authenticated && (
                <Link href="/dashboard" className="mr-2">
                  <Button size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700">
                    Dashboard
                  </Button>
                </Link>
              )}
              <button
                id="menu-button"
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-purple-600 focus:outline-none"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu" 
            className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: mobileMenuOpen ? '1000px' : '0px' }}
          >
            <div className="px-4 py-3 space-y-3">
              <Link href="/help" className="block py-2 text-gray-700 hover:text-purple-600">
                Commands
              </Link>
              <Link href="/embed-widget" className="block py-2 text-gray-700 hover:text-purple-600">
                Widget
              </Link>
              <Link href="/embed" className="block py-2 text-gray-700 hover:text-purple-600">
                Embed Link
              </Link>
              
              {authenticated ? (
                <>
                  <div className="pt-2 border-t border-gray-200">
                    <Link href="/profile" className="block py-2 text-gray-700 hover:text-purple-600">
                      Profile
                    </Link>
                    <Link href="/transactions" className="block py-2 text-gray-700 hover:text-purple-600">
                      Transactions
                    </Link>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      login();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Login with Twitter
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Send Crypto Payments with a Simple Tweet
              </h2>
              <p className="text-lg sm:text-xl mb-8">
                Just mention our bot <a href="https://x.com/HederaPayBot" target="_blank" rel="noopener noreferrer" className="underline font-semibold">@HederaPayBot</a> and type a simple command to send HBAR to anyone on Twitter. 
                Fast, secure, and powered by Hedera.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {authenticated ? (
                  <Link href="/dashboard">
                    <Button className="bg-white text-purple-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg shadow-md w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </Link>
              ) : (
                <Button
                  onClick={login}
                    className="bg-white text-purple-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg shadow-md w-full sm:w-auto"
                >
                  Get Started
                </Button>
              )}
              </div>
            </div>
            <div className="hidden md:flex md:justify-center md:items-center">
              <HeroCommandDemo />
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
            <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect your account</h3>
              <p className="text-gray-600">
                Link your Twitter and Hedera accounts in our secure dashboard.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Send a command</h3>
              <p className="text-gray-600">
                Tweet a payment instruction mentioning <a href="https://x.com/HederaPayBot" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">@HederaPayBot</a> and the recipient.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment processed</h3>
              <p className="text-gray-600">
                We securely process the payment on the Hedera network and confirm it for you.
              </p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/help">
              <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                View All Commands
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 text-2xl sm:text-3xl mb-3">🔄</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Simple Commands</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Send funds with intuitive commands like "send 5 HBAR to @friend"
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 text-2xl sm:text-3xl mb-3">🛡️</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm sm:text-base text-gray-600">
                All transactions processed on Hedera's secure ledger
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 text-2xl sm:text-3xl mb-3">💬</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Chat Widget</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Embed our interactive chat widget on your website
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 text-2xl sm:text-3xl mb-3">📊</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Transaction History</h3>
              <p className="text-sm sm:text-base text-gray-600">
                View and track all your previous payments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Twitter Integration Section */}
      <div className="py-12 sm:py-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Seamless Twitter Integration</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              HederaPayBot works directly with Twitter, allowing you to send cryptocurrency without leaving your favorite social platform.
            </p>
            
            {/* Twitter feature limitation notice - Updated for clarity */}
            <div className="mt-4 mx-auto max-w-2xl bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Twitter Widget Embedding Limitation</h3>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>Due to Twitter's platform limitations, our widget cannot be directly embedded within Twitter. All bot functionality is fully working - you can interact with @HederaPayBot through tweets and use the widget on your own website!</p>
                    <p className="mt-2">Follow our bot at <a href="https://x.com/HederaPayBot" target="_blank" rel="noopener noreferrer" className="font-medium underline">@HederaPayBot</a> on X to try it out.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-500 text-2xl sm:text-3xl mb-3">🔄</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Send Payments via Tweet</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Simply mention @HederaPayBot with a command like "send 5 HBAR to @friend" - no need to leave Twitter.
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-500 text-2xl sm:text-3xl mb-3">🔒</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure Twitter Authentication</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Connect your Twitter account for secure, verified transactions without exposing your private keys.
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-500 text-2xl sm:text-3xl mb-3">🌐</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Twitter Widget Integration</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Embed our widget on any website with automatic Twitter user detection for a seamless experience.
              </p>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 text-center">
            <a href="https://x.com/HederaPayBot" target="_blank" rel="noopener noreferrer">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                Try on Twitter Now
              </Button>
            </a>
            <p className="text-sm mt-2">Follow <a href="https://x.com/HederaPayBot" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">@HederaPayBot</a> on X</p>
          </div>
        </div>
      </div>

      {/* Widget Embed Section */}
      <div className="py-10 sm:py-12 md:py-16 bg-gradient-to-b from-white to-gray-50" ref={widgetSectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 relative inline-block">
                  Embed HederaPayBot on Your Website
                  <div className="absolute -bottom-2 left-0 w-2/3 h-1 bg-gradient-to-r from-purple-600 to-transparent rounded"></div>
                </h2>
                <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-gray-600">
                  Add the HederaPayBot widget to your website to allow your users to interact with the Hedera blockchain directly.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { id: 'installation', icon: '💻', title: 'Simple Installation', desc: 'Copy-paste a single code snippet to integrate' },
                  { id: 'customizable', icon: '🎨', title: 'Customizable', desc: 'Match your brand colors and style' },
                  { id: 'responsive', icon: '📱', title: 'Fully Responsive', desc: 'Works on all devices and screen sizes' },
                  { id: 'updates', icon: '🔄', title: 'Seamless Updates', desc: 'Always running the latest version' }
                ].map((feature) => (
                  <div 
                    key={feature.id}
                    onMouseEnter={() => setActiveFeature(feature.id)}
                    onMouseLeave={() => setActiveFeature(null)}
                    className={`relative bg-gradient-to-br from-purple-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-purple-100 
                      transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                      ${activeFeature === feature.id ? 'ring-2 ring-purple-400 shadow-md' : ''}`}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0 text-purple-600 text-lg sm:text-xl">{feature.icon}</div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base text-gray-800">{feature.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{feature.desc}</p>
                      </div>
                    </div>
                    
                    {/* Animated indicator */}
                    {activeFeature === feature.id && (
                      <div className="absolute -right-1 -bottom-1 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
                <Link href="/embed-widget" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">
                    Get Embed Widget
                  </Button>
                </Link>
                <Link href="/help" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-50">
                    View API Docs
                  </Button>
                </Link>
              </div>
              
              {/* Mobile version of device selector - only shows on mobile */}
              <div className="flex md:hidden justify-center mt-6 sm:mt-8 mb-2">
                <div className="flex items-center justify-center space-x-4 sm:space-x-6 bg-gray-100 rounded-full p-2 shadow-inner">
                  <button 
                    onClick={() => toggleView('web')}
                    disabled={isAnimating}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-300
                      ${widgetView === 'web' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}
                  >
                    <span>🖥️</span>
                    <span className="text-xs sm:text-sm">Website</span>
                  </button>
                  
                  <button 
                    onClick={() => toggleView('twitter')}
                    disabled={isAnimating}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-300
                      ${widgetView === 'twitter' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                  >
                    <span>🐦</span>
                    <span className="text-xs sm:text-sm">Twitter</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center order-1 lg:order-2">
              {/* Device Frame Selector - hidden on mobile */}
              <div className="hidden md:flex items-center justify-center space-x-8 mb-8">
                <button 
                  onClick={() => toggleView('web')}
                  disabled={isAnimating}
                  className={`flex flex-col items-center transition-all duration-300
                    ${widgetView === 'web' ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-80 scale-100'}`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-2 
                    ${widgetView === 'web' 
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-500'}`}
                  >
                    <span className="text-xl sm:text-2xl">🖥️</span>
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${widgetView === 'web' ? 'text-purple-600' : 'text-gray-500'}`}>Website</span>
                </button>
                
                <button 
                  onClick={() => toggleView('twitter')}
                  disabled={isAnimating}
                  className={`flex flex-col items-center transition-all duration-300
                    ${widgetView === 'twitter' ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-80 scale-100'}`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-2
                    ${widgetView === 'twitter' 
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-500'}`}
                  >
                    <span className="text-xl sm:text-2xl">🐦</span>
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${widgetView === 'twitter' ? 'text-blue-500' : 'text-gray-500'}`}>Twitter</span>
                </button>
              </div>

              {/* Creative Device Frame */}
              <div className={`perspective-1000 transition-all duration-700 
                ${isAnimating ? 'rotate-y-180 opacity-0' : 'rotate-y-0 opacity-100'}
                ${isMobile ? 'w-full max-w-sm' : 'w-auto'}`}
              >
                <div className={`relative ${widgetView === 'web' ? 'pb-8' : 'pb-4'} ${isMobile ? 'mx-auto' : ''}`}>
                  {/* Device frame */}
                  <div className={`relative rounded-xl overflow-hidden transform transition-all duration-500
                    ${widgetView === 'web' 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900 p-2 md:p-3 shadow-xl' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 md:p-2 shadow-lg'}`}
                  >
                    {/* Shiny edges effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30"></div>
                    
                    {/* Screen part */}
                    <div className="bg-white rounded-md overflow-hidden">
                      {/* Browser/App bar */}
                      <div className={`flex items-center justify-between px-2 py-1 text-xs ${
                        widgetView === 'web' 
                          ? 'bg-gray-100 border-b border-gray-200' 
                          : 'bg-blue-100 border-b border-blue-200'
                      }`}>
                        <div className="flex items-center space-x-1">
                          {widgetView === 'web' ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            </>
                          ) : (
                            <div className="text-blue-500 text-sm">🐦</div>
                          )}
                        </div>
                        <div className="px-2 py-0.5 bg-white bg-opacity-60 rounded text-xs truncate max-w-[180px] mx-auto">
                          {widgetView === 'web' ? 'yourwebsite.com/payments' : '@HederaPayBot'}
                        </div>
                        <div className="w-4"></div>
                      </div>
                      
                      {/* Widget content with animated transition */}
                      <div className={`relative group transition-all duration-700 ease-in-out transform
                        ${isAnimating ? 'scale-95 blur-sm' : 'scale-100 blur-0'}`}>
                        <iframe 
                          ref={widgetIframeRef}
                          src="/embed-widget" 
                          className={`w-full ${isInteracting ? 'pointer-events-auto' : 'pointer-events-none'}`}
                          style={widgetDimensions[widgetView]}
                          title="HederaPayBot Widget Preview" 
                          sandbox="allow-scripts allow-same-origin"
                        />
                        
                        {/* Twitter feature limitation overlay - Updated for clarity */}
                        {widgetView === 'twitter' && (
                          <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center text-white p-4">
                            <div className="bg-amber-500/90 rounded-full p-2 mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <h3 className="text-center font-bold mb-2">Cannot Display on Twitter</h3>
                            <p className="text-center text-sm opacity-90">Due to Twitter's limitations, this widget cannot be embedded directly on Twitter.</p>
                            <p className="text-center text-xs mt-2 opacity-80">Widget works perfectly on your own website!</p>
                          </div>
                        )}
                        
                        {/* Interactive hover overlay */}
                        <div 
                          onClick={toggleWidgetInteraction} 
                          className={`absolute inset-0 transition-opacity duration-300 cursor-pointer
                            ${isInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-black/5'}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm md:text-base font-medium text-center">
                            {isInteracting ? 'Interacting...' : (
                              <span className="flex flex-col items-center">
                                <span className="text-xs opacity-80">👆 Tap/click to</span>
                                <span className="text-shadow-sm">interact with widget</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interaction indicator */}
                        {isInteracting && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                            <span className="flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                              Interactive
                            </span>
                          </div>
                        )}
                        
                        {/* Position helper circles - only visible on hover */}
                        <div className="absolute -inset-0.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500">
                          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Device details for web */}
                    {widgetView === 'web' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 md:w-6 md:h-6 bg-gray-800 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Floating badge */}
                  <div className={`absolute -right-2 -top-2 px-2 py-1 rounded-full text-xs font-medium shadow-lg
                    ${widgetView === 'web' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-blue-500 text-white'}`}>
                    {widgetView === 'web' ? 'Website' : 'Twitter'}
                  </div>
                  
                  {/* Shadow and reflection */}
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-4 
                    bg-gradient-to-b from-black/20 to-transparent rounded-full blur-md`}></div>
                </div>
              </div>

              {/* Enhanced embed code with syntax highlighting */}
              <div className="mt-8 w-full max-w-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Integration Code</h4>
                  <button 
                    onClick={copyEmbedCode}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isCopied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    } flex items-center gap-1`}
                  >
                    {isCopied ? (
                      <>
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-2 md:p-3 overflow-hidden shadow-inner">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-1">
                    <pre className="text-xs md:text-sm whitespace-pre-wrap">
                      <code>
                        <span className="text-blue-400">&lt;iframe</span> 
                        <span className="text-green-400"> src</span>=<span className="text-yellow-400">"{widgetView === 'web' ? '/embed-widget' : '/embed-widget?twitter=true'}"</span>
                        <br className="hidden sm:block" /><span className="text-green-400"> width</span>=<span className="text-yellow-400">"{widgetView === 'web' ? '400' : '350'}"</span>
                        <span className="text-green-400"> height</span>=<span className="text-yellow-400">"{widgetView === 'web' ? '500' : '450'}"</span>
                        <br className="hidden sm:block" /><span className="text-green-400"> style</span>=<span className="text-yellow-400">"border:none;"</span>
                        <span className="text-green-400"> title</span>=<span className="text-yellow-400">"HederaPayBot"</span>
                        <span className="text-blue-400">&gt;&lt;/iframe&gt;</span>
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              
              {/* Responsive controls */}
              <div className="mt-6 w-full max-w-sm">
                <h4 className="text-sm font-medium mb-2">Responsive Preview</h4>
                <div className="grid grid-cols-4 gap-2">
                  {['Desktop', 'Tablet', 'Mobile', 'Auto'].map((device) => (
                    <button 
                      key={device}
                      className={`px-2 py-1.5 text-xs rounded-md transition-all border 
                        ${device === 'Desktop' 
                          ? 'bg-purple-100 border-purple-300 text-purple-800 font-medium' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                    >
                      {device}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center">
                  <div className="h-2 flex-grow bg-gray-200 rounded-full">
                    <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <span className="text-xs ml-2 text-gray-500">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add a fancy decorative background element */}
      <div className="absolute left-0 right-0 h-full max-h-[600px] overflow-hidden -z-10 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-40 h-40 rounded-full bg-purple-700 blur-3xl"></div>
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-blue-700 blur-3xl"></div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Hedera Twitter Pay</h3>
              <p className="text-gray-400 mb-4">Send cryptocurrency payments to Twitter users with simple commands.</p>
              <p>&copy; {new Date().getFullYear()} Hedera Twitter Pay. All rights reserved.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Command Reference</Link></li>
                <li><Link href="/embed-widget" className="text-gray-400 hover:text-white transition-colors">Widget</Link></li>
                <li><Link href="/embed" className="text-gray-400 hover:text-white transition-colors">Embed Link</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Connect</h4>
              <ul className="space-y-2">
                <li><a href="https://x.com/HederaPayBot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="https://hedera.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Hedera</a></li>
                <li><a href="https://github.com/yourusername/hedera-twitter-pay" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Account</h4>
              <ul className="space-y-2">
                {authenticated ? (
                  <>
                    <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                    <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link></li>
                    <li><Link href="/transactions" className="text-gray-400 hover:text-white transition-colors">Transactions</Link></li>
                  </>
                ) : (
                  <li>
                    <Button
                      onClick={login}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white hover:border-white"
                    >
                      Login with Twitter
                    </Button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Add keyframe animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .text-shadow-sm {
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .rotate-y-0 {
          transform: rotateY(0);
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </main>
  );
}

