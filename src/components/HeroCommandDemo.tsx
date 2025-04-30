'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Twitter } from 'lucide-react';

interface HeroCommandDemoProps {
  autoPlay?: boolean;
}

export function HeroCommandDemo({ autoPlay = true }: HeroCommandDemoProps) {
  const [typedText, setTypedText] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [step, setStep] = useState(0);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Reset and start animation on mount
  useEffect(() => {
    if (autoPlay) {
      startAnimation();
    }
    
    return () => {
      resetAnimation();
    };
  }, [autoPlay]);

  const resetAnimation = () => {
    setTypedText('');
    setShowOutput(false);
    setStep(0);
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  const startAnimation = () => {
    resetAnimation();
    
    const command = '@hederapaybot send @friend 5 HBAR for lunch yesterday';
    let charIndex = 0;
    
    // Type out the command character by character
    typingIntervalRef.current = setInterval(() => {
      if (charIndex < command.length) {
        setTypedText(prev => command.substring(0, charIndex + 1));
        charIndex++;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        
        // Show output after typing is complete
        transitionTimeoutRef.current = setTimeout(() => {
          setShowOutput(true);
          
          // Reset animation after some delay for continuous demo
          transitionTimeoutRef.current = setTimeout(() => {
            resetAnimation();
            startAnimation();
          }, 5000);
        }, 800);
      }
    }, 50);
  };

  return (
    <div className="bg-gray-900 p-5 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 relative overflow-hidden border border-gray-800 animate-fade-up">
      {/* Twitter header bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 backdrop-blur-sm bg-opacity-80">
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-sm font-medium text-gray-200 flex items-center">
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          <span>Twitter</span>
        </div>
      </div>
      
      <div className="mt-10 border border-gray-700 rounded-xl overflow-hidden bg-black">
        {/* User Tweet */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex">
            <Avatar className="h-12 w-12 mr-3 ring-2 ring-blue-500 ring-offset-2 ring-offset-black">
              <AvatarImage alt="User Profile" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center">
                <span className="text-lg font-bold">JD</span>
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-bold text-white">Jane Crypto</p>
                <span className="ml-2 text-blue-400 text-sm font-medium">@jane_crypto</span>
                <span className="ml-2 text-gray-500 text-xs">·</span>
                <span className="ml-2 text-gray-500 text-xs">Just now</span>
              </div>
              <p className="text-gray-100 mt-2 leading-relaxed">{typedText}</p>
              {typedText.length < 43 && (
                <span className="inline-block w-2 h-5 bg-blue-400 animate-pulse ml-0.5 mt-1"></span>
              )}
            </div>
          </div>
        </div>
        
        {/* Bot Response */}
        {showOutput && (
          <div className="p-4 bg-gray-900 animate-fade-in border-t border-gray-800">
            <div className="flex">
              <Avatar className="h-12 w-12 mr-3 ring-2 ring-purple-500 ring-offset-2 ring-offset-black">
                <AvatarImage alt="Hedera Pay Bot" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center">
                  <span className="font-bold text-xl">H</span>
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="font-bold text-white">Hedera Pay Bot</p>
                  <span className="ml-2 text-blue-400 text-sm font-medium">@hederapaybot</span>
                  <span className="ml-2 text-gray-500 text-xs">·</span>
                  <span className="ml-2 text-gray-500 text-xs">Just now</span>
                </div>
                <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl mt-3 shadow-lg transform animate-slide-up">
                  <div className="flex items-center text-green-400">
                    <div className="bg-green-900 bg-opacity-30 p-1 rounded-full mr-2">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Payment sent successfully!</span>
                  </div>
                  <p className="mt-2 text-gray-300">Sent 5 HBAR to @friend</p>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Transaction ID: 0.0.12345@1680000000.000000000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Subtle glowing effect */}
      <div className="absolute -z-10 -bottom-5 -left-5 w-40 h-40 rounded-full bg-purple-600 blur-3xl opacity-10"></div>
      <div className="absolute -z-10 -top-5 -right-5 w-40 h-40 rounded-full bg-blue-600 blur-3xl opacity-10"></div>
    </div>
  );
}

// Add advanced animations
const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-up {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from { 
    opacity: 0;
    transform: translateY(8px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-in-out forwards;
}

.animate-fade-up {
  animation: fade-up 0.7s ease-out forwards;
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  // Check if style already exists to avoid duplication
  if (!document.getElementById('hero-command-demo-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'hero-command-demo-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
} 