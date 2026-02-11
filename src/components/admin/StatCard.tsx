import { DollarSign, ShoppingCart, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  variant: 'sales' | 'orders' | 'expenses' | 'balance';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantConfig = {
  sales: {
    className: 'stat-card-sales',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  orders: {
    className: 'stat-card-orders',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
  },
  expenses: {
    className: 'stat-card-expenses',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
  balance: {
    className: 'stat-card-balance',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, variant, trend }: StatCardProps) => {
  const config = variantConfig[variant];

  return (
    <Card className={cn('border transition-all hover:shadow-soft', config.className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('p-2 rounded-lg', config.iconBg)}>
          <Icon className={cn('w-4 h-4', config.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={cn(
            'text-xs mt-1 flex items-center gap-1',
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from yesterday
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
