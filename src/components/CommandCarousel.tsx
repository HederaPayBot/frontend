import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CommandExample {
  command: string;
  description: string;
  output: React.ReactNode;
}

interface CommandCarouselProps {
  examples: CommandExample[];
  autoPlayInterval?: number; // in ms
}

export function CommandCarousel({ 
  examples, 
  autoPlayInterval = 8000 
}: CommandCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to go to next example
  const nextExample = () => {
    setActiveIndex((prev) => (prev + 1) % examples.length);
  };

  // Function to go to previous example
  const prevExample = () => {
    setActiveIndex((prev) => (prev - 1 + examples.length) % examples.length);
  };

  // Effect for typing animation and showing output
  useEffect(() => {
    // Reset state when active example changes
    setTypedText('');
    setShowOutput(false);

    const currentCommand = examples[activeIndex].command;
    let charIndex = 0;

    // Type out the command character by character
    const typingInterval = setInterval(() => {
      if (charIndex < currentCommand.length) {
        setTypedText(currentCommand.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        // Show output after typing is complete
        setTimeout(() => {
          setShowOutput(true);
        }, 500);
      }
    }, 50); // Adjust typing speed as needed

    return () => {
      clearInterval(typingInterval);
    };
  }, [activeIndex, examples]);

  // Effect for auto-play
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      nextExample();
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, autoPlayInterval]);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Twitter Command Guide</h2>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? '▶' : '⏸'}
            </Button>
          </div>
        </div>

        <div className="relative bg-black rounded-lg p-4 text-white font-mono text-sm overflow-hidden mb-2 min-h-[120px]">
          <div className="flex items-center mb-2 border-b border-gray-700 pb-2">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-2 text-gray-400 text-xs">Twitter Command Line</div>
          </div>

          <div>
            <span className="text-green-400">twitter$</span> <span className="text-white">{typedText}</span>
            {typedText.length < examples[activeIndex].command.length && (
              <span className="inline-block w-2 h-4 bg-white animate-pulse ml-0.5"></span>
            )}
          </div>

          {showOutput && (
            <div className="mt-4 text-gray-300 animate-fade-in">
              {examples[activeIndex].output}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {examples[activeIndex].description}
        </p>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={prevExample}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          <div className="flex space-x-1">
            {examples.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === activeIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setActiveIndex(index)}
              ></div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={nextExample}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Add this keyframe for fade-in animation
const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-in-out forwards;
}
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 