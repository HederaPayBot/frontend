'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set isClient to true once component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!isClient) return;

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

    // Try to extract Twitter username from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const twitterUsername = urlParams.get('twitter_username');
    const twitterId = urlParams.get('twitter_id');

    if (twitterUsername) {
      setUserName(twitterUsername);
      if (twitterId) {
        setTwitterUser({
          username: twitterUsername,
          userId: twitterId,
        });
      } else {
        // If we have the username but no ID, we can fetch it
        fetchTwitterUserInfo(twitterUsername);
      }
    } else {
      // Try to detect Twitter data from parent window if embedded
      tryGetTwitterDataFromParent();
    }

    // Toggle dark mode based on system preference initially
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    // Add animated intro tip with improved timing based on screen size
    const tipDelay = screenSize === 'xs' || screenSize === 'sm' ? 1500 : 2000;
    
    setTimeout(() => {
      const tipMessage: Message = {
        id: Date.now().toString(),
        text: "💡 Try saying: 'Send 5 HBAR to @friend' or 'What's my balance?'",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tipMessage]);
    }, tipDelay);
  }, [isClient, screenSize]);

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

  // Handle Twitter login button
  const handleTwitterLogin = () => {
    if (!isClient) return;
    
    // Open Twitter auth window or redirect to Twitter auth endpoint
    // This would need to be implemented with your Twitter integration
    const twitterLoginUrl = '/api/auth/twitter';
    window.open(twitterLoginUrl, '_blank', 'width=600,height=600');
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
          text: `I'll connect your account with Twitter username @${twitterUsername}. Please authorize this connection.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        
        // Here we could trigger Twitter authentication
        // For now, just add a button in a follow-up message
        setTimeout(() => {
          const authMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: 'Click the button below to authorize with Twitter: <button id="twitter-auth-btn" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Connect Twitter</button>',
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, authMessage]);
          
          // Add event listener for the Twitter auth button after rendering
          setTimeout(() => {
            if (isClient) {
              const authBtn = document.getElementById('twitter-auth-btn');
              if (authBtn) {
                authBtn.addEventListener('click', handleTwitterLogin);
              }
            }
          }, 100);
        }, 1000);
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
      // Include Twitter info if available
      const twitterData = twitterUser ? {
        twitterUsername: twitterUser.username,
        twitterUserId: twitterUser.userId
      } : {};

      // Send message to backend
      const response = await fetch('/api/twitter/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: inputValue,
          userName: twitterUser?.username || userName,
          ...twitterData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Format the response, handling both string and array responses
      let responseText = '';
      if (typeof data.elizaResponse === 'string') {
        responseText = data.elizaResponse;
      } else if (Array.isArray(data.elizaResponse)) {
        // Join array elements with newlines
        responseText = data.elizaResponse.join('\n');
      } else {
        responseText = JSON.stringify(data.elizaResponse);
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

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 md:p-6">
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
        
        {/* Twitter Connection Banner - simplified on small screens */}
        {isFromTwitter && !twitterUser && (
          <div className={`bg-blue-100 text-blue-800 ${screenSize === 'xs' ? 'p-2 text-xs' : 'p-3 text-sm'} flex items-center justify-between`}>
            <p className={screenSize === 'xs' ? 'mr-2' : ''}>
              {screenSize === 'xs' ? 'Connect Twitter' : 'Connect your Twitter account to use HederaPayBot'}
            </p>
            <button 
              onClick={handleTwitterLogin}
              className={`bg-blue-500 hover:bg-blue-600 text-white ${screenSize === 'xs' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'} rounded-md transition-colors whitespace-nowrap`}
            >
              Connect
            </button>
          </div>
        )}
        
        {/* Messages - adaptive padding */}
        <div className={`flex-1 ${getAdaptivePadding()} overflow-y-auto bg-opacity-80 backdrop-blur-sm`}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`max-w-[85%] mb-3 rounded-lg ${screenSize === 'xs' ? 'p-2' : 'p-3'} ${
                message.sender === 'user'
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
              className={`${screenSize === 'xs' ? 'p-1.5' : 'p-2'} rounded-r-md ${
                isLoading || !inputValue.trim()
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
              ? <span>HederaPayBot {!twitterUser && <button onClick={handleTwitterLogin} className="underline">Connect</button>}</span>
              : <>Powered by HederaPayBot • <a href="/help" target="_blank" className="underline">View all commands</a>
                {!twitterUser && <> • <button onClick={handleTwitterLogin} className="underline">Connect Twitter</button></>}
                </>
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
          
          <h3 className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 mb-2 sm:mb-3">Advanced Twitter Integration</h3>
          <p className="mb-3">To pass Twitter user information to the widget:</p>
          
          <div className="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded-md mb-3 sm:mb-4">
            <code className="text-xs sm:text-sm block">
              {'<iframe src="' + (isClient ? window.location.origin : '') + '/embed-widget?twitter_username=USERNAME&twitter_id=TWITTER_ID" width="400" height="600" frameborder="0"></iframe>'}
            </code>
          </div>
          
          <p className="mb-3">Replace <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">USERNAME</code> and <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">TWITTER_ID</code> with the user's Twitter information.</p>
          
          <div className="mt-5 sm:mt-6">
            <h3 className="font-bold mb-2">Twitter ID Lookup Tool</h3>
            <p className="mb-2 text-sm sm:text-base">Need to find a Twitter ID? Use our lookup tool:</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Twitter username" 
                className="flex-1 p-1.5 sm:p-2 border rounded-l text-sm sm:text-base"
              />
              <button className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-r hover:bg-blue-700 transition-colors text-sm sm:text-base">
                Find ID
              </button>
            </div>
            <p className="text-xs sm:text-sm mt-2 text-gray-500">
              You can also use services like <a href="https://findtwitter.id" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">findtwitter.id</a> or <a href="https://findidfb.com/find-twitter-id/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">findidfb.com</a>
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
          0% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.4; transform: scale(0.8); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
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