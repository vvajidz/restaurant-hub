import { useState } from 'react';
import { Search, Plus, Minus, Trash2, Receipt, CreditCard, Banknote, Smartphone, UtensilsCrossed, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { usePOSStore } from '@/stores/posStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { PaymentMethod, OrderItem, Invoice, Order } from '@/types';
import InvoiceDisplay from '@/components/staff/InvoiceDisplay';

const StaffPOS = () => {
  const { menuItems } = useRestaurantStore();
  const { 
    savedOrders,
    getSavedOrderByPosNumber, 
    generateInvoice, 
    generateDirectInvoice,
  } = usePOSStore();

  const { orders, tables, updateOrderStatus } = useRestaurantStore();
  const [billingMode, setBillingMode] = useState<'served' | 'pos' | 'direct'>('served');
  const servedOrders = orders.filter(o => o.status === 'served' || o.status === 'ready');
  const [selectedServedOrder, setSelectedServedOrder] = useState<Order | null>(null);
  const [posNumber, setPosNumber] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [foundOrder, setFoundOrder] = useState<ReturnType<typeof getSavedOrderByPosNumber>>(undefined);
  const [directItems, setDirectItems] = useState<OrderItem[]>([]);
  const [directTableNumber, setDirectTableNumber] = useState('1');
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const handleSearchPOS = () => {
    const order = getSavedOrderByPosNumber(posNumber);
    if (order) {
      setFoundOrder(order);
      toast.success('Order found!');
    } else {
      setFoundOrder(undefined);
      toast.error('Order not found or already paid');
    }
  };

  const handleAddDirectItem = (menuItem: typeof menuItems[0]) => {
    setDirectItems(prev => {
      const existing = prev.find(i => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map(i => 
          i.menuItem.id === menuItem.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const handleUpdateDirectQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setDirectItems(prev => prev.filter(i => i.menuItem.id !== itemId));
    } else {
      setDirectItems(prev => 
        prev.map(i => i.menuItem.id === itemId ? { ...i, quantity } : i)
      );
    }
  };

  const handleRemoveDirectItem = (itemId: string) => {
    setDirectItems(prev => prev.filter(i => i.menuItem.id !== itemId));
  };

  const calculateDirectTotal = () => {
    const subtotal = directItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const gst = subtotal * 0.1;
    return { subtotal, gst, total: subtotal + gst };
  };

  const handleGenerateInvoice = () => {
    if (billingMode === 'served' && selectedServedOrder) {
      const tableNum = tables.find(t => t.id === selectedServedOrder.tableId)?.number || 1;
      const invoice = generateDirectInvoice(selectedServedOrder.items, tableNum, selectedPayment);
      updateOrderStatus(selectedServedOrder.id, 'paid');
      setGeneratedInvoice(invoice);
      setSelectedServedOrder(null);
      toast.success('Invoice generated!');
    } else if (billingMode === 'pos' && foundOrder) {
      const invoice = generateInvoice(foundOrder.id, selectedPayment);
      setGeneratedInvoice(invoice);
      setFoundOrder(undefined);
      setPosNumber('');
      toast.success('Invoice generated!');
    } else if (billingMode === 'direct' && directItems.length > 0) {
      const tableNum = parseInt(directTableNumber) || 1;
      const invoice = generateDirectInvoice(directItems, tableNum, selectedPayment);
      setGeneratedInvoice(invoice);
      setDirectItems([]);
      toast.success('Invoice generated!');
    }
  };

  const handleNewBill = () => {
    setGeneratedInvoice(null);
    setDirectItems([]);
    setPosNumber('');
    setFoundOrder(undefined);
    setSelectedServedOrder(null);
    setSelectedPayment('cash');
  };

  const directTotals = calculateDirectTotal();
  const unpaidOrders = savedOrders.filter(o => !o.isPaid);

  const paymentMethods = [
    { value: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
    { value: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
    { value: 'upi' as PaymentMethod, label: 'UPI', icon: Smartphone },
  ];

  // Show invoice if generated
  if (generatedInvoice) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 bg-muted/30">
        <div className="w-full max-w-md">
          <ScrollArea className="h-[70vh] border rounded-lg bg-background shadow-lg">
            <InvoiceDisplay invoice={generatedInvoice} />
          </ScrollArea>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleNewBill} className="flex-1">
              New Bill
            </Button>
            <Button onClick={() => window.print()} className="flex-1">
              Print
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Left Side - Menu/Order Selection (65%) */}
      <div className="flex-[65] border-r border-border flex flex-col">
        {/* Header with Mode Toggle */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Point of Sale
              </h1>
              <p className="text-sm text-muted-foreground">Generate bills and invoices</p>
            </div>
          </div>
          
          <Tabs value={billingMode} onValueChange={(v) => setBillingMode(v as 'served' | 'pos' | 'direct')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="served">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                Served
                {servedOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">{servedOrders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pos">
                Saved Orders
                {unpaidOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">{unpaidOrders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="direct">Quick Billing</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {billingMode === 'served' ? (
          /* Served Orders from Kitchen */
          <ScrollArea className="flex-1 p-4">
            {servedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">No served orders</p>
                <p className="text-muted-foreground text-xs mt-1">Orders marked as served in kitchen will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {servedOrders.map((order) => {
                  const table = tables.find(t => t.id === order.tableId);
                  const timeSince = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedServedOrder(order)}
                      className={cn(
                        'p-4 border rounded-lg text-left transition-all hover:border-primary',
                        selectedServedOrder?.id === order.id && 'border-primary bg-primary/5 ring-1 ring-primary'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={order.status === 'served' ? 'default' : 'secondary'}>
                          {order.status === 'served' ? 'Served' : 'Ready'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeSince}m
                        </span>
                      </div>
                      <div className="font-bold text-lg">Table {table?.number || '?'}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {order.items.map(i => i.menuItem.name).join(', ')}
                      </div>
                      <div className="text-sm font-bold mt-2 text-primary">
                        ${order.total.toFixed(2)} • {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        ) : billingMode === 'direct' ? (
          <>
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
                    onClick={() => handleAddDirectItem(item)}
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
          </>
        ) : (
          /* Saved Orders Mode */
          <div className="flex-1 p-4 space-y-4">
            {/* Search by POS Number */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter POS number (e.g., POS123456)"
                value={posNumber}
                onChange={(e) => setPosNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPOS()}
              />
              <Button onClick={handleSearchPOS}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Unpaid Orders Grid */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Unpaid Orders</h3>
              {unpaidOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No unpaid orders</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {unpaidOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        setPosNumber(order.posNumber);
                        setFoundOrder(order);
                      }}
                      className={cn(
                        'p-4 border rounded-lg text-left transition-all hover:border-primary',
                        foundOrder?.id === order.id && 'border-primary bg-primary/5'
                      )}
                    >
                      <div className="font-mono font-bold text-primary">{order.posNumber}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Table {order.tableNumber}
                      </div>
                      <div className="text-sm mt-2">
                        {order.items.length} items • <span className="font-bold">${order.total.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Bill Summary (35%) */}
      <div className="flex-[35] flex flex-col bg-card min-w-[320px]">
        {/* Served Order Info */}
        {billingMode === 'served' && selectedServedOrder && (
          <div className="p-4 border-b border-border bg-primary/5">
            <div className="flex justify-between items-center">
              <Badge>Served</Badge>
              <span className="text-sm text-muted-foreground">
                Table {tables.find(t => t.id === selectedServedOrder.tableId)?.number || '?'}
              </span>
            </div>
          </div>
        )}

        {/* Table Number (for direct billing) */}
        {billingMode === 'direct' && (
          <div className="p-4 border-b border-border">
            <label className="text-sm font-medium text-muted-foreground">Table Number</label>
            <Input
              type="number"
              value={directTableNumber}
              onChange={(e) => setDirectTableNumber(e.target.value)}
              className="mt-1"
              min={1}
            />
          </div>
        )}

        {/* Selected Order Info (for POS mode) */}
        {billingMode === 'pos' && foundOrder && (
          <div className="p-4 border-b border-border bg-primary/5">
            <div className="flex justify-between items-center">
              <Badge variant="secondary">{foundOrder.posNumber}</Badge>
              <span className="text-sm text-muted-foreground">Table {foundOrder.tableNumber}</span>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <ScrollArea className="flex-1 p-4">
          {billingMode === 'served' ? (
            selectedServedOrder ? (
              <div className="space-y-2">
                {selectedServedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <span className="font-medium text-sm">{item.menuItem.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-sm">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <UtensilsCrossed className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">Select a served order to bill</p>
              </div>
            )
          ) : billingMode === 'direct' ? (
            directItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Receipt className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No items selected</p>
                <p className="text-muted-foreground text-xs mt-1">Tap menu items to add</p>
              </div>
            ) : (
              <div className="space-y-2">
                {directItems.map((item) => (
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
                            onClick={() => handleUpdateDirectQuantity(item.menuItem.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateDirectQuantity(item.menuItem.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleRemoveDirectItem(item.menuItem.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <span className="font-bold text-sm">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            /* POS Mode - Show found order items */
            foundOrder ? (
              <div className="space-y-2">
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <span className="font-medium text-sm">{item.menuItem.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-sm">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Select an order to bill</p>
              </div>
            )
          )}
        </ScrollArea>

        {/* Bill Footer */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Totals */}
          {((billingMode === 'served' && selectedServedOrder) || (billingMode === 'direct' && directItems.length > 0) || (billingMode === 'pos' && foundOrder)) && (
            <>
              <div className="space-y-1">
                {(() => {
                  let subtotal = 0, gst = 0, total = 0;
                  if (billingMode === 'served' && selectedServedOrder) {
                    subtotal = selectedServedOrder.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
                    gst = subtotal * 0.1;
                    total = subtotal + gst;
                  } else if (billingMode === 'direct') {
                    subtotal = directTotals.subtotal;
                    gst = directTotals.gst;
                    total = directTotals.total;
                  } else if (foundOrder) {
                    subtotal = foundOrder.subtotal;
                    gst = foundOrder.gst;
                    total = foundOrder.total;
                  }
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GST (10%)</span>
                        <span>${gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                        <span>Total</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedPayment(value)}
                      className={cn(
                        'p-3 border rounded-lg flex flex-col items-center gap-1 transition-all',
                        selectedPayment === value 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'hover:border-muted-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Invoice Button */}
              <Button onClick={handleGenerateInvoice} className="w-full" size="lg">
                <Receipt className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </>
          )}

          {/* Clear Button for Direct Mode */}
          {billingMode === 'direct' && directItems.length > 0 && (
            <Button variant="outline" onClick={() => setDirectItems([])} className="w-full">
              Clear Items
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPOS;
