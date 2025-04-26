import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatting";

interface BalanceCardProps {
  tokenSymbol: string;
  tokenAmount: number;
  fiatValue: number;
}

export function BalanceCard({ tokenSymbol, tokenAmount, fiatValue }: BalanceCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-2">Balance</h2>
        <div className="flex flex-col">
          <div className="text-5xl font-bold mb-1">{tokenAmount} {tokenSymbol}</div>
          <div className="text-lg text-muted-foreground">${formatCurrency(fiatValue)}</div>
        </div>
      </CardContent>
    </Card>
  );
} 