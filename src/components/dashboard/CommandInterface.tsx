// src/components/dashboard/CommandInterface.tsx
'use client';

import { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";
import { useApp } from "@/context/AppContext";
import { elizaAPI } from "@/utils/api";

interface CommandInterfaceProps {
  onExecute?: (command: string, params: Record<string, any>) => void;
}

export function CommandInterface({ onExecute }: CommandInterfaceProps) {
  const { user } = useApp();
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [elizaResponse, setElizaResponse] = useState<string | null>(null);

  const handleExecuteCommand = async () => {
    if (!commandInput.trim() || !user) return;
    
    try {
      setIsExecuting(true);
      setElizaResponse(null);
      
      // Call Eliza API with the command
      const response = await elizaAPI.sendCommand(commandInput, user.twitterUsername);
      
      if (response.success && response.elizaResponse) {
        setElizaResponse(response.elizaResponse);
        toast.success("Command executed successfully");
      } else {
        // Parse command locally for basic commands as fallback
      const [action, ...args] = commandInput.split(' ');
      
      // Different actions based on command
      if (action === 'send') {
        // Example: send 5 HBAR to @username
        const amount = parseFloat(args[0]);
        const token = args[1];
        // Check if args[3] is "to" and args[4] starts with @
        const recipient = args[3] === 'to' && args[4].startsWith('@') ? args[4].substring(1) : args[4];
        
        toast.info("Processing transaction", {
          description: `Sending ${amount} ${token} to @${recipient}`
        });
        
        // Call the onExecute callback with parsed params
        onExecute?.('send', { amount, token, recipient });
      } 
      else if (action === 'mint') {
        // Example: mint 10 NFT
        const amount = parseFloat(args[0]);
        const token = args[1];
        
        toast.info("Processing mint", {
          description: `Minting ${amount} ${token}`
        });
        
        onExecute?.('mint', { amount, token });
      }
      else if (action === 'airdrop') {
        // Example: airdrop 5 HSUITE to @user1 @user2 @user3
        const amount = parseFloat(args[0]);
        const token = args[1];
        const recipients = args.slice(3).filter(arg => arg.startsWith('@')).map(user => user.substring(1));
        
        toast.info("Processing airdrop", {
          description: `Airdropping ${amount} ${token} to ${recipients.length} users`
        });
        
        onExecute?.('airdrop', { amount, token, recipients });
      }
      else {
        toast.error("Unknown command", {
          description: "Try 'send', 'mint', or 'airdrop'"
        });
        }
      }
      
    } catch (error: any) {
      toast.error("Command failed", {
        description: error.message || "Something went wrong"
      });
    } finally {
      setIsExecuting(false);
      setCommandInput('');
    }
  };

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-medium">Command Center</h3>
      <div className="flex gap-2">
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Type a command (e.g., send 5 HBAR to @username)"
            value={commandInput}
            onValueChange={setCommandInput}
          />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            <CommandGroup heading="Examples">
              <CommandItem onSelect={() => setCommandInput("send 5 HBAR to @friend")}>
                <span>send 5 HBAR to @friend</span>
              </CommandItem>
              <CommandItem onSelect={() => setCommandInput("show my balance")}>
                <span>show my balance</span>
              </CommandItem>
              <CommandItem onSelect={() => setCommandInput("mint 10 NFT")}>
                <span>mint 10 NFT</span>
              </CommandItem>
              <CommandItem onSelect={() => setCommandInput("airdrop 5 HSUITE to @user1 @user2")}>
                <span>airdrop 5 HSUITE to @user1 @user2</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <Button 
          onClick={handleExecuteCommand}
          disabled={isExecuting || !commandInput.trim() || !user}
          className="bg-[#8247E5] hover:bg-[#7038d6]"
        >
          {isExecuting ? 'Executing...' : 'Execute'}
        </Button>
      </div>
      
      {elizaResponse && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border">
          <p className="text-sm font-medium">Response:</p>
          <p className="text-sm">{elizaResponse}</p>
        </div>
      )}
    </div>
  );
}