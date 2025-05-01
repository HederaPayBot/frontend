'use client';

import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  User, 
  ClipboardList, 
  LogOut,
  ChevronDown,
  Loader2,
  Home
} from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const router = useRouter();
  const { logout, authenticated, ready, user } = usePrivy();
  
  const twitterUsername = user?.twitter?.username || user?.email?.address?.split('@')[0] || 'user';
  const isLoading = !ready;

  // Get avatar URL from user object
  const getUserAvatar = () => {
    // Try to get Twitter image if available
    if (user?.twitter?.username) {
      return `https://unavatar.io/twitter/${user.twitter.username}`;
    }
    // Fall back to a generic avatar based on username
    return `https://avatar.vercel.sh/${twitterUsername}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hedera Twitter Pay</h1>
            </Link>
            <div className="hidden md:flex h-6 bg-gray-200 dark:bg-gray-700 w-px mx-1"></div>
            <div className="hidden md:flex gap-2">
              <Button 
                variant="ghost" 
                className="text-sm font-medium"
                onClick={() => router.push('/dashboard')}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-sm font-medium"
                onClick={() => router.push('/transactions')}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Transactions
              </Button>
              
              <Button 
                variant="ghost" 
                className="text-sm font-medium"
                onClick={() => router.push('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              
            <Button 
                variant="ghost" 
                className="text-sm font-medium"
                onClick={() => router.push('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-purple-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
            </div>
          ) : authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={getUserAvatar()} 
                      alt={twitterUsername} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs">
                      {twitterUsername.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">@{twitterUsername}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">@{twitterUsername}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/transactions')}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>Transactions</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => router.push('/')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 