import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { Twitter, CalendarDays, User, ArrowRight, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ProfileCard() {
  const { user, isLinked } = useApp();

  if (!user || !user.twitterUsername) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="w-full border border-gray-200 shadow-md overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <CardTitle className="text-lg">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white shadow-md">
              <AvatarImage src={`https://unavatar.io/twitter/${user.twitterUsername}`} alt={user.twitterUsername} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-sm sm:text-base">
                {user.twitterUsername.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold truncate max-w-[180px]">@{user.twitterUsername}</h3>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                <Twitter className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-blue-500" />
                <span>Twitter Connected</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center text-xs sm:text-sm">
              <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-purple-600 flex-shrink-0" />
              <span className="text-gray-600 font-medium">Registered:</span>
              <span className="ml-1.5 sm:ml-2 text-gray-800 truncate">{formatDate(user.registeredAt)}</span>
            </div>
            
            <div className="flex items-center text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-purple-600 flex-shrink-0" />
              <span className="text-gray-600 font-medium">Account Status:</span>
              <span className="ml-1.5 sm:ml-2 text-gray-800">{isLinked ? 'Linked to Hedera' : 'Not Linked'}</span>
            </div>
            
            <div className="flex items-center text-xs sm:text-sm">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-purple-600 flex-shrink-0" />
              <span className="text-gray-600 font-medium">Account Type:</span>
              <span className="ml-1.5 sm:ml-2 text-gray-800">{user.twitterId ? 'Twitter User' : 'Anonymous'}</span>
            </div>
          </div>
          
          {/* Network Badge */}
          {user.networkType && (
            <div className="mt-2 sm:mt-3">
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {user.networkType === 'mainnet' ? 'Mainnet' : 'Testnet'} Network
              </div>
            </div>
          )}
          
          {/* Twitter Profile Link */}
          <div className="pt-2 sm:pt-3 border-t mt-2 sm:mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs sm:text-sm text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center justify-center"
              onClick={() => window.open(`https://twitter.com/${user.twitterUsername}`, '_blank')}
            >
              <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              View Twitter Profile
              <ArrowRight className="h-3 w-3 ml-1.5 sm:ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 