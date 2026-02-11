import { useState } from 'react';
import { Search, Plus, Minus, Trash2, Send, Users, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { MenuItem, OrderItem, Table } from '@/types';

const StaffOrders = () => {
  const { menuItems, tables, addOrder, updateTableStatus } = useRestaurantStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // Get unique categories
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.menuItem.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => i.menuItem.id !== itemId));
    } else {
      setCartItems(prev => 
        prev.map(i => i.menuItem.id === itemId ? { ...i, quantity } : i)
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.menuItem.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedTable(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const handleSendToKitchen = () => {
    if (!selectedTable || cartItems.length === 0) return;

    addOrder({
      tableId: selectedTable.id,
      items: cartItems,
      status: 'new',
      total: getCartTotal(),
    });

    updateTableStatus(selectedTable.id, 'occupied');
    clearCart();
    toast.success('Order sent to kitchen!');
  };

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Left Side - Menu (70%) */}
      <div className="flex-[7] border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Create Order
          </h1>
          <p className="text-sm text-muted-foreground">Select items and send to kitchen</p>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="shrink-0">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Menu Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="menu-item-card text-left group"
              >
                <div className="flex flex-col h-full">
                  <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side - Order Cart (30%) */}
      <div className="flex-[3] flex flex-col bg-card min-w-[300px]">
        {/* Table Selection */}
        <div className="p-4 border-b border-border">
          <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant={selectedTable ? 'secondary' : 'outline'} 
                className="w-full justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                {selectedTable ? `Table ${selectedTable.number}` : 'Select Table'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Table</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-4 gap-2 py-4">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => {
                      if (table.status === 'free') {
                        setSelectedTable(table);
                        setTableDialogOpen(false);
                      }
                    }}
                    disabled={table.status !== 'free'}
                    className={cn(
                      'aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all',
                      table.status === 'free' && 'table-free cursor-pointer',
                      table.status === 'occupied' && 'table-occupied cursor-not-allowed opacity-60',
                      table.status === 'reserved' && 'table-reserved cursor-not-allowed opacity-60',
                      selectedTable?.id === table.id && 'ring-2 ring-primary ring-offset-2'
                    )}
                  >
                    <span className="font-bold text-lg">{table.number}</span>
                    <span className="text-xs">{table.capacity} seats</span>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cart Items */}
        <ScrollArea className="flex-1 p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No items in order</p>
              <p className="text-muted-foreground text-xs mt-1">Tap items to add them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <Card key={item.menuItem.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          ${item.menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.menuItem.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Item Count */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span className="font-medium">{itemCount} items</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={cartItems.length === 0}
            >
              Clear
            </Button>
            <Button
              onClick={handleSendToKitchen}
              disabled={!selectedTable || cartItems.length === 0}
              className="bg-success hover:bg-success/90"
            >
              <Send className="w-4 h-4 mr-2" />
              To Kitchen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffOrders;
