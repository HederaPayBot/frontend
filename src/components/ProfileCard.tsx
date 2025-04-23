import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";

export function ProfileCard() {
  const { user } = useApp();

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={`https://unavatar.io/twitter/${user.twitterUsername}`} alt={user.twitterUsername} />
            <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
              {user.twitterUsername.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">@{user.twitterUsername}</h3>
            <div className="flex flex-col mt-1">
              <span className="text-sm text-muted-foreground">
                Twitter Connected
              </span>
              {user.hederaAccountId && (
                <span className="text-xs font-mono mt-1 text-muted-foreground">
                  Hedera ID: {user.hederaAccountId}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Send Payment Commands</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-xs text-purple-600 block">
              @hederapaybot send @recipient 10 HBAR
            </code>
            <code className="text-xs text-purple-600 block mt-2">
              @hederapaybot send @recipient 5 USDC
            </code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use these commands on Twitter to send payments to other users.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 