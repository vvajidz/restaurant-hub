import { useState } from 'react';
import { Search, Receipt, CreditCard, Banknote, Smartphone, Plus, Minus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { usePOSStore } from '@/stores/posStore';
import type { PaymentMethod, OrderItem, Invoice } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import InvoiceDisplay from './InvoiceDisplay';

interface BillingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BillingDialog = ({ open, onOpenChange }: BillingDialogProps) => {
  const { menuItems } = useRestaurantStore();
  const { 
    getSavedOrderByPosNumber, 
    generateInvoice, 
    generateDirectInvoice,
    savedOrders 
  } = usePOSStore();

  const [activeTab, setActiveTab] = useState<'pos' | 'direct'>('pos');
  const [posNumber, setPosNumber] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [foundOrder, setFoundOrder] = useState<ReturnType<typeof getSavedOrderByPosNumber>>(undefined);
  const [directItems, setDirectItems] = useState<OrderItem[]>([]);
  const [directTableNumber, setDirectTableNumber] = useState('1');
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [...new Set(menuItems.map(item => item.category))];
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'All');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category === selectedCategory;
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
    if (activeTab === 'pos' && foundOrder) {
      const invoice = generateInvoice(foundOrder.id, selectedPayment);
      setGeneratedInvoice(invoice);
      toast.success('Invoice generated!');
    } else if (activeTab === 'direct' && directItems.length > 0) {
      const tableNum = parseInt(directTableNumber) || 1;
      const invoice = generateDirectInvoice(directItems, tableNum, selectedPayment);
      setGeneratedInvoice(invoice);
      toast.success('Invoice generated!');
    }
  };

  const handleClose = () => {
    setPosNumber('');
    setFoundOrder(undefined);
    setDirectItems([]);
    setGeneratedInvoice(null);
    setSelectedPayment('cash');
    onOpenChange(false);
  };

  const directTotals = calculateDirectTotal();
  const unpaidOrders = savedOrders.filter(o => !o.isPaid);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing
          </DialogTitle>
        </DialogHeader>

        {generatedInvoice ? (
          <div className="space-y-4">
            <ScrollArea className="h-[60vh]">
              <InvoiceDisplay invoice={generatedInvoice} />
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGeneratedInvoice(null)}>
                New Bill
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pos' | 'direct')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pos">By POS Number</TabsTrigger>
              <TabsTrigger value="direct">Food Selection</TabsTrigger>
            </TabsList>

            <TabsContent value="pos" className="space-y-4 mt-4">
              {/* Search by POS Number */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="posNumber">POS Number</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="posNumber"
                      placeholder="Enter POS number (e.g., POS123456)"
                      value={posNumber}
                      onChange={(e) => setPosNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchPOS()}
                    />
                    <Button onClick={handleSearchPOS}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Unpaid Orders List */}
              {unpaidOrders.length > 0 && !foundOrder && (
                <div>
                  <Label className="text-sm text-muted-foreground">Unpaid Orders</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {unpaidOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => {
                          setPosNumber(order.posNumber);
                          setFoundOrder(order);
                        }}
                        className="p-3 border rounded-lg text-left hover:bg-accent transition-colors"
                      >
                        <div className="font-mono font-medium">{order.posNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          Table {order.tableNumber} • {order.items.length} items • ${order.total.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Found Order Details */}
              {foundOrder && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge variant="secondary">{foundOrder.posNumber}</Badge>
                        <span className="ml-2 text-muted-foreground">Table {foundOrder.tableNumber}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">${foundOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1">
                      {foundOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.menuItem.name} x{item.quantity}</span>
                          <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${foundOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (10%)</span>
                        <span>${foundOrder.gst.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method Selection */}
              {foundOrder && (
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'cash', label: 'Cash', icon: Banknote },
                      { value: 'card', label: 'Card', icon: CreditCard },
                      { value: 'upi', label: 'UPI', icon: Smartphone },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedPayment(value as PaymentMethod)}
                        className={cn(
                          'p-4 border rounded-lg flex flex-col items-center gap-2 transition-all',
                          selectedPayment === value 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'hover:border-muted-foreground'
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                  <Button onClick={handleGenerateInvoice} className="w-full" size="lg">
                    <Receipt className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="direct" className="mt-4">
              <div className="grid grid-cols-5 gap-4 h-[50vh]">
                {/* Menu Selection (Left 3 cols) */}
                <div className="col-span-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-1 flex-wrap">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>

                  <ScrollArea className="h-[35vh]">
                    <div className="grid grid-cols-2 gap-2">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAddDirectItem(item)}
                          className="p-3 border rounded-lg text-left hover:bg-accent transition-colors"
                        >
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-primary font-bold">${item.price.toFixed(2)}</div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Bill Summary (Right 2 cols) */}
                <div className="col-span-2 border rounded-lg p-4 flex flex-col">
                  <div className="mb-3">
                    <Label htmlFor="directTable">Table Number</Label>
                    <Input
                      id="directTable"
                      type="number"
                      value={directTableNumber}
                      onChange={(e) => setDirectTableNumber(e.target.value)}
                      className="mt-1"
                      min={1}
                    />
                  </div>

                  <ScrollArea className="flex-1">
                    {directItems.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        Select items to add
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {directItems.map((item) => (
                          <div key={item.menuItem.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.menuItem.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ${(item.menuItem.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleUpdateDirectQuantity(item.menuItem.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleUpdateDirectQuantity(item.menuItem.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => handleRemoveDirectItem(item.menuItem.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {directItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${directTotals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (10%)</span>
                        <span>${directTotals.gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary">${directTotals.total.toFixed(2)}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-2">
                        {[
                          { value: 'cash', icon: Banknote },
                          { value: 'card', icon: CreditCard },
                          { value: 'upi', icon: Smartphone },
                        ].map(({ value, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => setSelectedPayment(value as PaymentMethod)}
                            className={cn(
                              'p-2 border rounded flex items-center justify-center transition-all',
                              selectedPayment === value 
                                ? 'border-primary bg-primary/10' 
                                : 'hover:border-muted-foreground'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', selectedPayment === value && 'text-primary')} />
                          </button>
                        ))}
                      </div>

                      <Button onClick={handleGenerateInvoice} className="w-full mt-2">
                        <Receipt className="w-4 h-4 mr-2" />
                        Generate Invoice
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillingDialog;
