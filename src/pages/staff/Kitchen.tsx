import { useState, useEffect } from 'react';
import { Clock, ChefHat, CheckCircle, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

const formatTimeSince = (date: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
};

const getStatusConfig = (status: Order['status']) => {
  switch (status) {
    case 'new':
      return {
        label: 'New Order',
        icon: Clock,
        className: 'kitchen-card-new',
        badgeClass: 'bg-info text-info-foreground',
      };
    case 'preparing':
      return {
        label: 'Preparing',
        icon: ChefHat,
        className: 'kitchen-card-preparing',
        badgeClass: 'bg-warning text-warning-foreground',
      };
    case 'ready':
      return {
        label: 'Ready',
        icon: CheckCircle,
        className: 'kitchen-card-ready',
        badgeClass: 'bg-success text-success-foreground',
      };
    default:
      return {
        label: status,
        icon: Clock,
        className: '',
        badgeClass: 'bg-muted text-muted-foreground',
      };
  }
};

const StaffKitchen = () => {
  const { orders, tables, updateOrderStatus } = useRestaurantStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for live timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders for kitchen display (only active orders)
  const kitchenOrders = orders.filter(
    (order) => ['new', 'preparing', 'ready'].includes(order.status)
  );

  const getTableNumber = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    return table?.number || '?';
  };

  const handleStatusChange = (orderId: string, currentStatus: Order['status']) => {
    const nextStatus: Record<string, Order['status']> = {
      new: 'preparing',
      preparing: 'ready',
      ready: 'served',
    };
    
    const next = nextStatus[currentStatus];
    if (next) {
      updateOrderStatus(orderId, next);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background dark p-4 space-y-4">
      {/* Force dark mode for kitchen display */}
      <style>{`
        .kitchen-display { 
          --background: 20 20% 8%;
          --foreground: 30 20% 95%;
          --card: 20 18% 12%;
          --card-foreground: 30 20% 95%;
          --muted: 20 15% 18%;
          --muted-foreground: 30 15% 60%;
          --border: 20 15% 22%;
        }
      `}</style>
      
      <div className="kitchen-display">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kitchen Display</h1>
              <p className="text-muted-foreground">
                {kitchenOrders.length} active order{kitchenOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono font-bold text-foreground">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Status Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* New Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-info animate-pulse" />
              <h2 className="font-semibold text-foreground">New Orders</h2>
              <Badge variant="secondary" className="ml-auto">
                {kitchenOrders.filter(o => o.status === 'new').length}
              </Badge>
            </div>
            <div className="space-y-3">
              {kitchenOrders
                .filter((o) => o.status === 'new')
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    tableNumber={getTableNumber(order.tableId)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
            </div>
          </div>

          {/* Preparing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
              <h2 className="font-semibold text-foreground">Preparing</h2>
              <Badge variant="secondary" className="ml-auto">
                {kitchenOrders.filter(o => o.status === 'preparing').length}
              </Badge>
            </div>
            <div className="space-y-3">
              {kitchenOrders
                .filter((o) => o.status === 'preparing')
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    tableNumber={getTableNumber(order.tableId)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
            </div>
          </div>

          {/* Ready */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <h2 className="font-semibold text-foreground">Ready to Serve</h2>
              <Badge variant="secondary" className="ml-auto">
                {kitchenOrders.filter(o => o.status === 'ready').length}
              </Badge>
            </div>
            <div className="space-y-3">
              {kitchenOrders
                .filter((o) => o.status === 'ready')
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    tableNumber={getTableNumber(order.tableId)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
            </div>
          </div>
        </div>

        {kitchenOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ChefHat className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">All caught up!</h3>
            <p className="text-muted-foreground mt-1">No pending orders at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  tableNumber: number | string;
  onStatusChange: (orderId: string, status: Order['status']) => void;
}

const OrderCard = ({ order, tableNumber, onStatusChange }: OrderCardProps) => {
  const config = getStatusConfig(order.status);
  const StatusIcon = config.icon;

  const buttonLabels: Record<string, string> = {
    new: 'Start Preparing',
    preparing: 'Mark Ready',
    ready: 'Mark Served',
  };

  return (
    <Card className={cn('overflow-hidden transition-all', config.className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">#{tableNumber}</span>
            <Badge className={config.badgeClass}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTimeSince(order.createdAt)}</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-sm font-bold">
                {item.quantity}
              </span>
              <span className="text-foreground font-medium">{item.menuItem.name}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          variant={order.status === 'ready' ? 'default' : 'secondary'}
          onClick={() => onStatusChange(order.id, order.status)}
        >
          {buttonLabels[order.status]}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StaffKitchen;
