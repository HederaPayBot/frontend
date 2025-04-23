'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Token {
  id: string;
  symbol: string;
  name: string;
  logoUrl?: string;
}

interface TokenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  tokens?: Token[];
  label?: string;
}

export function TokenSelector({
  value,
  onChange,
  tokens = defaultTokens,
  label = "Token"
}: TokenSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium block">{label}</label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a token" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Available Tokens</SelectLabel>
            {tokens.map(token => (
              <SelectItem key={token.id} value={token.symbol}>
                <div className="flex items-center">
                  {token.logoUrl ? (
                    <img 
                      src={token.logoUrl} 
                      alt={token.symbol} 
                      className="w-5 h-5 mr-2 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold mr-2">
                      {token.symbol.substring(0, 2)}
                    </div>
                  )}
                  <span>{token.name} ({token.symbol})</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

// Default tokens available in the system
const defaultTokens: Token[] = [
  {
    id: 'hbar',
    symbol: 'HBAR',
    name: 'Hedera',
    logoUrl: '/tokens/hbar.png'
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    logoUrl: '/tokens/usdc.png'
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    logoUrl: '/tokens/usdt.png'
  },
  {
    id: 'hsuite',
    symbol: 'HSUITE',
    name: 'HashPack Suite',
  }
]; 