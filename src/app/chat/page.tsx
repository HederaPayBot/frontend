'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function ChatPage() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set document title in useEffect instead of using metadata
  useEffect(() => {
    document.title = 'HederaPayBot - Interactive Chat';
    
    // You could also set meta description this way if needed
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Chat directly with the HederaPayBot to interact with the Hedera blockchain');
    }
    
    // Toggle dark mode based on system preference initially
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

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
      // Send message to backend
      const response = await fetch('/api/twitter/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: inputValue,
          userName: userName,
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

  // Format message text with markdown-like formatting
  const formatMessage = (text: string) => {
    // Replace code blocks
    let formatted = text.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
    
    // Replace inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Replace links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
    );

    // Replace line breaks with <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  // Get base theme classes
  const getThemeClasses = () => {
    return isDarkMode 
      ? 'bg-gray-900 text-white' 
      : 'bg-white text-gray-800';
  };

  // Get user message classes
  const getUserMessageClasses = () => {
    return isDarkMode 
      ? 'bg-blue-600 text-white' 
      : 'bg-blue-500 text-white';
  };

  // Get bot message classes
  const getBotMessageClasses = () => {
    return isDarkMode 
      ? 'bg-gray-800 text-white border border-gray-700' 
      : 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Get input classes
  const getInputClasses = () => {
    return isDarkMode 
      ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500' 
      : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500';
  };

  // Change displayed name and timestamp format
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Animations
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className={`${isExpanded ? 'fixed inset-0 z-50' : 'fixed bottom-5 right-5 z-50 w-96 h-96'} flex flex-col rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${getThemeClasses()}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-600'} text-white`}>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
            <span className="text-xl">🪙</span>
          </div>
          <div>
            <h2 className="font-bold">HederaPayBot</h2>
            <p className="text-xs opacity-80">Hedera Blockchain Assistant</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1 rounded hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/10"
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? '⬇️' : '⬆️'}
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <motion.div 
        className="flex-1 p-4 overflow-y-auto"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`max-w-[80%] mb-4 rounded-lg p-3 ${
                message.sender === 'user'
                  ? `${getUserMessageClasses()} ml-auto`
                  : `${getBotMessageClasses()}`
              }`}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex items-center mb-1">
                <span className="text-xs opacity-70">
                  {message.sender === 'user' ? 'You' : 'HederaPayBot'} • {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div 
                className="message-content break-words"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
              />
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              className={`max-w-[80%] mb-4 rounded-lg p-3 ${getBotMessageClasses()}`}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </motion.div>
      
      {/* Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or type a command..."
            className={`flex-1 p-2 rounded-l-md border ${getInputClasses()} focus:outline-none`}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={`p-2 rounded-r-md ${
              isLoading || !inputValue.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-xs text-center opacity-60">
          Powered by HederaPayBot • <a href="/help" target="_blank" className="underline">View all commands</a>
        </div>
      </div>
      
      {/* Embed code information (hidden in embed) */}
      <div className="mt-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 hidden">
        <h2 className="text-lg font-bold mb-2">Embed this chat on your website</h2>
        <p className="mb-4">Copy and paste this code into your website's HTML:</p>
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
          <code className="text-sm">
            {typeof window !== 'undefined' 
              ? `<iframe src="${window.location.origin}/chat" width="400" height="600" frameborder="0"></iframe>`
              : `<iframe src="/chat" width="400" height="600" frameborder="0"></iframe>`
            }
          </code>
        </div>
      </div>
    </div>
  );
} 