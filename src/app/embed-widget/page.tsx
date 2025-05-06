'use client';

import React, { useState, useRef, useEffect } from 'react';
import { elizaAPI } from '@/utils/api';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type TwitterUserInfo = {
  username: string;
  userId: string;
  displayName?: string;
  profileImage?: string;
};

export default function EmbedWidgetPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! I'm HederaPayBot, your Hedera blockchain assistant. Ask me anything about Hedera or try commands like 'what's my HBAR balance?' or 'show token holders for 0.0.1234567'",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('visitor');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [twitterUser, setTwitterUser] = useState<TwitterUserInfo | null>(null);
  const [isFromTwitter, setIsFromTwitter] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isClient, setIsClient] = useState(false);
  const [isInsideIframe, setIsInsideIframe] = useState(false);
  const [showUsernameScreen, setShowUsernameScreen] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'username' | 'complete'>('welcome');
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Set isClient to true once component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check localStorage for saved username on initial load
  useEffect(() => {
    if (!isClient) return;

    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const twitterUsername = urlParams.get('twitter_username');
    
    if (twitterUsername) {
      // Username from URL has highest priority
      setUserName(twitterUsername);
      setShowUsernameScreen(false);
      setTwitterUser({
        username: twitterUsername,
        userId: urlParams.get('twitter_id') || 'unknown',
      });
      
      // Display welcome message with Twitter username from URL
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: `Welcome @${twitterUsername}! Ready to explore Hedera with you.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, welcomeMessage]);
      }, 1000);
    } else {
      // Check localStorage for saved username
      const savedUsername = localStorage.getItem('hederabot_twitter_username');
      if (savedUsername) {
        setUserName(savedUsername);
        setShowUsernameScreen(false);
        setTwitterUser({
          username: savedUsername,
          userId: 'unknown',
        });
        
        // No welcome message here, as they're a returning user
      } else {
        // No saved username, show onboarding
        setShowUsernameScreen(true);
        
        // Start animation sequence for onboarding
        setTimeout(() => {
          setOnboardingStep('username');
        }, 2000);
      }
    }

    // Toggle dark mode based on system preference initially
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // We'll add the tip message in a separate useEffect to avoid duplicates
  }, [isClient]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus the username input field when it appears
  useEffect(() => {
    if (onboardingStep === 'username' && usernameInputRef.current) {
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 500);
    }
  }, [onboardingStep]);

  // Detect screen size and orientation
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      // Get screen width and set size category
      const width = window.innerWidth;
      if (width < 480) setScreenSize('xs');
      else if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else setScreenSize('xl');

      // Set orientation
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Initial check
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  // Detect if user is on Twitter and get Twitter info
  useEffect(() => {
    if (!isClient || showUsernameScreen) return;

    // Check if inside iframe
    try {
      setIsInsideIframe(window.self !== window.top);
    } catch (e) {
      // If we can't access window.self or window.top, we're likely in an iframe
      setIsInsideIframe(true);
    }

    // Check referrer to see if user came from Twitter
    const referrer = document.referrer;
    if (referrer && referrer.includes('twitter.com')) {
      setIsFromTwitter(true);
    }

    // Try to detect Twitter data from parent window if embedded
    tryGetTwitterDataFromParent();
  }, [isClient, showUsernameScreen]);
  
  // Add the tip message after a delay, but only if we're not showing the onboarding
  useEffect(() => {
    if (!isClient || showUsernameScreen) return;
    
    // Add animated intro tip with improved timing based on screen size
    const tipDelay = screenSize === 'xs' || screenSize === 'sm' ? 1500 : 2000;
    
    const tipTimer = setTimeout(() => {
      const tipMessage: Message = {
        id: Date.now().toString(),
        text: "💡 Try saying: 'Send 5 HBAR to @friend' or 'What's my balance?'",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tipMessage]);
    }, tipDelay);
    
    return () => clearTimeout(tipTimer);
  }, [isClient, screenSize, showUsernameScreen]);

  // Function to fetch Twitter user info
  const fetchTwitterUserInfo = async (username: string) => {
    try {
      // We could implement our own API endpoint to get Twitter user info
      // For now, we're just setting the username
      setTwitterUser({
        username,
        userId: 'unknown', // We would fetch this from an API
      });

      // Display welcome message with Twitter username
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Welcome, @${username}! I see you're connecting from Twitter. You can now use Hedera services directly.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, welcomeMessage]);
    } catch (error) {
      console.error('Error fetching Twitter user info:', error);
    }
  };

  // Function to try to get Twitter data from parent window if embedded in Twitter
  const tryGetTwitterDataFromParent = () => {
    if (!isClient) return;

    try {
      // This would need to be implemented with Twitter Web API if available
      // or through a message passing system with the parent window
      // For now, we're just checking if we're in an iframe
      if (window.self !== window.top) {
        // We're in an iframe, possibly embedded in Twitter
        window.addEventListener('message', (event) => {
          // Process message from parent (Twitter)
          if (event.data && event.data.type === 'TWITTER_USER_INFO') {
            const { username, userId, displayName } = event.data;
            setTwitterUser({
              username,
              userId,
              displayName,
            });
            setUserName(username);
          }
        });

        // Request Twitter info from parent
        window.parent.postMessage({ type: 'REQUEST_TWITTER_USER_INFO' }, '*');
      }
    } catch (error) {
      console.error('Error getting Twitter data from parent:', error);
    }
  };

  // Function to extract Twitter username from input
  const extractTwitterUsername = (input: string): string | null => {
    // Handle full Twitter URLs
    const urlRegex = /twitter\.com\/([A-Za-z0-9_]+)/i;
    const urlMatch = input.match(urlRegex);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }

    // Handle @username format
    const usernameRegex = /@([A-Za-z0-9_]+)/;
    const usernameMatch = input.match(usernameRegex);
    if (usernameMatch && usernameMatch[1]) {
      return usernameMatch[1];
    }

    // If input looks like just a username without @ or URL
    if (/^[A-Za-z0-9_]+$/.test(input)) {
      return input;
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check if user is trying to link Twitter account
    const twitterUsername = extractTwitterUsername(inputValue);
    if ((inputValue.toLowerCase().includes('connect') || inputValue.toLowerCase().includes('link')) && 
        inputValue.toLowerCase().includes('twitter') && twitterUsername) {
      
      // Add user message to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');

      // Handle Twitter connection attempt with extracted username
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `We can use your Twitter username @${twitterUsername} for your transactions. No additional authentication is needed.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);
      
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get the username to use
      const username = twitterUser?.username || userName;

      // Use the elizaAPI utility instead of direct fetch
      const data = await elizaAPI.sendMessage(inputValue, username);
      console.log(data, "eliza data");
      
      // Format the response from the elizaResponse array
      let responseText = '';
      if (data.elizaResponse && Array.isArray(data.elizaResponse)) {
        // Extract text from each response item
        responseText = data.elizaResponse
          .map(item => item.text)
          .filter(Boolean)
          .join('\n\n');
      } else {
        responseText = "Received a response, but couldn't parse it.";
      }

      // Add bot message to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the Hedera network right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message text with markdown-like formatting - with added responsiveness
  const formatMessage = (text: string) => {
    // Handle undefined or null text
    if (!text) return '';
    
    try {
      // Basic formatting - same as before
      let formatted = text.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
      formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
      
      // Replace links with responsive classes
      formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g, 
        `<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline ${screenSize === 'xs' ? 'text-xs' : 'text-sm'}">$1</a>`
      );
      
      // Replace Twitter mentions with styled version and responsive classes
      formatted = formatted.replace(
        /@([A-Za-z0-9_]+)/g,
        `<a href="https://twitter.com/$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline ${screenSize === 'xs' ? 'text-xs' : 'text-sm'}">@$1</a>`
      );
      
      // Replace line breaks with <br>
      formatted = formatted.replace(/\n/g, '<br>');
      
      return formatted;
    } catch (error) {
      console.error('Error formatting message:', error);
      return String(text); // Return as string if there's an error
    }
  };

  // Get base theme classes with added responsiveness
  const getThemeClasses = () => {
    return isDarkMode
      ? 'bg-gray-900 text-white'
      : 'bg-white text-gray-800';
  };

  // Get user message classes with responsiveness
  const getUserMessageClasses = () => {
    return isDarkMode
      ? 'bg-blue-600 text-white'
      : 'bg-blue-500 text-white';
  };

  // Get bot message classes with responsiveness
  const getBotMessageClasses = () => {
    return isDarkMode
      ? 'bg-gray-800 text-white border border-gray-700'
      : 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Get input classes with responsiveness
  const getInputClasses = () => {
    return isDarkMode
      ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500'
      : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500';
  };

  // Change displayed name and timestamp format
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Enhanced embed code with responsive attributes
  const getEmbedCode = () => {
    if (!isClient) return '';
    const origin = window.location.origin;
    return `<iframe 
  src="${origin}/embed-widget" 
  width="100%" 
  height="550" 
  style="max-width:400px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.15);" 
  frameborder="0"
  title="HederaPayBot Widget"
  loading="lazy"
></iframe>`;
  };

  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    if (!isClient) return;
    const embedCode = getEmbedCode();
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  // Responsive wrapper classes based on screen size and expanded state
  const getContainerClasses = () => {
    if (isExpanded) {
      return 'fixed inset-0 z-50 flex flex-col';
    }

    if (screenSize === 'xs') {
      return 'w-full h-[85vh] mx-auto flex flex-col';
    } else if (screenSize === 'sm') {
      return 'w-[95%] h-[500px] mx-auto flex flex-col';
    } else {
      return 'w-96 h-[500px] mx-auto flex flex-col';
    }
  };

  // Get adaptive font size based on screen size
  const getAdaptiveFontSize = (baseSize: string) => {
    switch (screenSize) {
      case 'xs': return `text-${baseSize} sm:text-${baseSize}`;
      case 'sm': return `text-${baseSize} sm:text-${baseSize}`;
      default: return `text-${baseSize}`;
    }
  };

  // Get adaptive padding based on screen size
  const getAdaptivePadding = () => {
    switch (screenSize) {
      case 'xs': return 'p-2 sm:p-3';
      case 'sm': return 'p-3';
      default: return 'p-4';
    }
  };

  // Handle username submission
  const handleUsernameSubmit = () => {
    // Validate username
    if (usernameInput.trim()) {
      // Remove @ if present at the beginning
      const cleanUsername = usernameInput.trim().replace(/^@/, '');
      
      // Basic validation for Twitter username
      if (!/^[A-Za-z0-9_]{1,15}$/.test(cleanUsername)) {
        setUsernameError('Please enter a valid Twitter username (letters, numbers, and underscores only)');
        return;
      }
      
      // Save username to state and localStorage
      setUserName(cleanUsername);
      localStorage.setItem('hederabot_twitter_username', cleanUsername);
      setTwitterUser({
        username: cleanUsername,
        userId: 'unknown',
      });
      
      // Transition animation
      setOnboardingStep('complete');
      setTimeout(() => {
        setShowUsernameScreen(false);
      }, 1000);
      
      // Add a personalized welcome message
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: `Welcome @${cleanUsername}! I'm excited to help you explore Hedera. Try asking about your balance or sending tokens to others.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, welcomeMessage]);
      }, 1500);
    } else {
      setUsernameError('Please enter a username or click "Continue as Guest"');
    }
  };

  // Skip username entry and use default account
  const handleSkipUsername = () => {
    const defaultUsername = 'chain_oracle';
    setUserName(defaultUsername);
    localStorage.setItem('hederabot_twitter_username', defaultUsername);
    setTwitterUser({
      username: defaultUsername,
      userId: 'unknown',
    });
    
    // Transition animation
    setOnboardingStep('complete');
    setTimeout(() => {
      setShowUsernameScreen(false);
    }, 1000);
    
    // Add a generic welcome message
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Welcome! You're using the default account @${defaultUsername}. You can access the Hedera blockchain and explore its features.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 md:p-6">
      {/* Username onboarding screen */}
      {showUsernameScreen && isClient && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center transition-all duration-500"
          style={{
            opacity: onboardingStep === 'complete' ? 0 : 1,
            transform: onboardingStep === 'complete' ? 'translateY(-20px)' : 'translateY(0)',
            pointerEvents: onboardingStep === 'complete' ? 'none' : 'auto'
          }}
        >
          <div className="w-full max-w-md p-6 rounded-2xl overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl animate-float" 
                style={{ animationDuration: '8s' }}></div>
              <div className="absolute bottom-1/4 right-1/3 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl animate-float" 
                style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
              <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-pink-500/20 blur-2xl animate-float" 
                style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
            </div>

            {/* Welcome step */}
            {onboardingStep === 'welcome' && (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🪙</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                  Welcome to HederaPayBot
                </h1>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Your personal assistant for the Hedera blockchain
                </p>
                <button 
                  onClick={() => setOnboardingStep('username')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 animate-pulse"
                  style={{ animationDuration: '2s' }}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Username step */}
            {onboardingStep === 'username' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center text-gray-800 dark:text-white">
                  Enter your Twitter username
                </h2>
                <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
                  We'll use this to identify you when interacting with the Hedera blockchain
                </p>
                
                <div className="mb-4 relative">
                  <div className="absolute left-3 top-3 text-gray-400">@</div>
                  <input
                    ref={usernameInputRef}
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value.trim());
                      if (usernameError) setUsernameError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUsernameSubmit();
                    }}
                    placeholder="YourTwitterHandle"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                      usernameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {usernameError && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{usernameError}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleUsernameSubmit}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg flex-1 transition-all hover:translate-y-[-2px]"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleSkipUsername}
                    className="px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 flex-1 transition-all"
                  >
                    Continue as Guest
                  </button>
                </div>
                
                <p className="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">
                  By continuing, you agree to connect with the Hedera blockchain using our service
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget container with responsive classes */}
      <div
        ref={containerRef}
        className={`${getContainerClasses()} rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${getThemeClasses()}`}
        style={{
          animation: 'fadeIn 0.5s ease-out',
          maxHeight: isExpanded ? '100vh' : (screenSize === 'xs' ? '88vh' : '600px'),
        }}
      >
        {/* Animated background effects - more responsive */}
        <div className="absolute inset-0 -z-10">
          {/* Base gradient glow */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-pink-500/30 blur-xl animate-pulse"
            style={{ animationDuration: '10s' }}
          ></div>

          {/* Floating particles - only on larger screens */}
          {screenSize !== 'xs' && (
            <>
              <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-blue-500/10 blur-md animate-float" style={{ animationDuration: '7s', animationDelay: '0s' }}></div>
              <div className="absolute top-3/4 right-1/4 w-8 h-8 rounded-full bg-purple-500/10 blur-md animate-float" style={{ animationDuration: '9s', animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-10 h-10 rounded-full bg-pink-500/10 blur-md animate-float" style={{ animationDuration: '11s', animationDelay: '2s' }}></div>
            </>
          )}
        </div>

        {/* Header - adaptive sizing */}
        <div className={`flex items-center justify-between ${screenSize === 'xs' ? 'p-3' : 'p-4'} bg-gradient-to-r ${isDarkMode ? 'from-blue-900 to-purple-900' : 'from-blue-600 to-purple-600'} text-white`}>
          <div className="flex items-center">
            <div className={`${screenSize === 'xs' ? 'h-7 w-7' : 'h-8 w-8'} rounded-full bg-white/20 flex items-center justify-center mr-2 animate-bounce`} style={{ animationDuration: '2s' }}>
              <span className={screenSize === 'xs' ? 'text-lg' : 'text-xl'}>🪙</span>
            </div>
            <div>
              <h2 className={`font-bold ${getAdaptiveFontSize('base')}`}>HederaPayBot</h2>
              <p className={`${getAdaptiveFontSize('xs')} opacity-80`}>
                {twitterUser ? `Connected as @${twitterUser.username}` : "Hedera Blockchain Assistant"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1 rounded hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-white/10 transition-all"
              aria-label={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? '⬇️' : '⬆️'}
            </button>
          </div>
        </div>

        {/* Messages - adaptive padding */}
        <div className={`flex-1 ${getAdaptivePadding()} overflow-y-auto bg-opacity-80 backdrop-blur-sm`}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`max-w-[85%] mb-3 rounded-lg ${screenSize === 'xs' ? 'p-2' : 'p-3'} ${message.sender === 'user'
                  ? `${getUserMessageClasses()} ml-auto`
                  : `${getBotMessageClasses()}`
                } opacity-0`}
              style={{
                animation: 'fadeIn 0.3s forwards',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-center mb-1">
                <span className={`opacity-70 ${getAdaptiveFontSize('xs')}`}>
                  {message.sender === 'user' ? (twitterUser ? `@${twitterUser.username}` : 'You') : 'HederaPayBot'}
                </span>
              </div>
              <div
                className={`message-content break-words ${getAdaptiveFontSize('sm')}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
              />
            </div>
          ))}
          {isLoading && (
            <div
              className={`max-w-[80%] mb-3 ${screenSize === 'xs' ? 'p-2' : 'p-3'} rounded-lg ${getBotMessageClasses()}`}
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" style={{ animation: 'pulse 1s infinite', animationDelay: '-0.3s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full" style={{ animation: 'pulse 1s infinite', animationDelay: '-0.15s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full" style={{ animation: 'pulse 1s infinite' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Command suggestions - scrollable and touch-friendly */}
        <div className={`${screenSize === 'xs' ? 'py-1 px-2' : 'px-4 py-2'} overflow-x-auto touch-pan-x bg-opacity-50 backdrop-blur-sm`}
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <div className="flex space-x-2">
            {['Balance', 'Send 5 HBAR', 'Create token', 'Help', 'Show holders', 'My account'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => setInputValue(cmd)}
                className={`${screenSize === 'xs' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors whitespace-nowrap`}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Input - adaptive sizing */}
        <div className={`${screenSize === 'xs' ? 'p-2' : 'p-4'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={twitterUser
                ? (screenSize === 'xs' ? `@${twitterUser.username}...` : `Send a command as @${twitterUser.username}...`)
                : (screenSize === 'xs' ? "Type a command..." : "Ask a question or type a command...")
              }
              className={`flex-1 ${screenSize === 'xs' ? 'p-1.5 text-sm' : 'p-2'} rounded-l-md border ${getInputClasses()} focus:outline-none`}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`${screenSize === 'xs' ? 'p-1.5' : 'p-2'} rounded-r-md ${isLoading || !inputValue.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={screenSize === 'xs' ? 'h-4 w-4' : 'h-5 w-5'} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className={`mt-1 ${getAdaptiveFontSize('xs')} text-center opacity-60`}>
            {screenSize === 'xs' 
              ? <span>HederaPayBot</span>
              : <>Powered by HederaPayBot • <a href="/help" target="_blank" className="underline">View all commands</a></>
            }
          </div>
        </div>
      </div>

      {/* Widget Embed Instructions - only shown when viewing the full page */}
      {isClient && !isInsideIframe && (
        <div className="mt-8 max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Embed HederaPayBot on Your Website</h2>
          <p className="mb-3 sm:mb-4">Copy and paste this code into your website's HTML:</p>

          <div className="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded-md mb-3 sm:mb-4 relative">
            <button
              onClick={copyEmbedCode}
              className="absolute right-2 top-2 p-1.5 sm:p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs sm:text-sm"
              aria-label="Copy embed code"
            >
              Copy
            </button>
            <code className="text-xs sm:text-sm break-all block pt-1 pb-2 pr-14">{getEmbedCode()}</code>
          </div>

          <h3 className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 mb-2 sm:mb-3">Responsive Options</h3>
          <p className="mb-3">The widget automatically adapts to different screen sizes:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <h4 className="font-semibold mb-2">Mobile Optimization</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Automatically adjusts size, font, and layout for smaller screens</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <h4 className="font-semibold mb-2">Expandable Interface</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Users can expand to fullscreen for better visibility</p>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 mb-2 sm:mb-3">Twitter Username Integration</h3>
          <p className="mb-3">To pass Twitter user information to the widget:</p>
          
          <div className="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded-md mb-3 sm:mb-4">
            <code className="text-xs sm:text-sm block">
              {'<iframe src="' + (isClient ? window.location.origin : '') + '/embed-widget?twitter_username=USERNAME" width="400" height="600" frameborder="0"></iframe>'}
            </code>
          </div>
          
          <p className="mb-3">Replace <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">USERNAME</code> with the user's Twitter username for personalized interaction.</p>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm border border-blue-100 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> No Twitter authentication is required. The widget will use the provided username for command interactions.
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.8; transform: scale(1); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .code-block {
          background-color: ${isDarkMode ? '#1f2937' : '#f3f4f6'};
          padding: 0.75rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 0.5rem 0;
          font-family: monospace;
          font-size: ${screenSize === 'xs' ? '0.75rem' : '0.875rem'};
          line-height: 1.5;
        }
        
        .inline-code {
          background-color: ${isDarkMode ? '#374151' : '#e5e7eb'};
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: ${screenSize === 'xs' ? '0.75rem' : '0.875rem'};
        }
        
        /* Touch-specific optimizations */
        @media (hover: none) {
          input, button {
            font-size: 16px; /* Prevent zoom on iOS */
          }
          
          button {
            padding: 0.5rem 0.75rem; /* Larger touch targets */
          }
        }
        
        /* Notch handling for iPhones */
        @supports (padding-top: env(safe-area-inset-top)) {
          .fixed {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
} 