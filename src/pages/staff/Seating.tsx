import { useState } from 'react';
import { Users, Calendar, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { cn } from '@/lib/utils';

const StaffSeating = () => {
  const { tables, updateTableStatus } = useRestaurantStore();
  const [selectedTable, setSelectedTable] = useState<typeof tables[0] | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerPhone: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    partySize: '',
  });

  const freeCount = tables.filter(t => t.status === 'free').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;

  const handleTableClick = (table: typeof tables[0]) => {
    setSelectedTable(table);
  };

  const handleStatusChange = (status: 'free' | 'occupied' | 'reserved') => {
    if (selectedTable) {
      updateTableStatus(selectedTable.id, status);
      setSelectedTable({ ...selectedTable, status });
    }
  };

  const handleBookTable = () => {
    if (selectedTable) {
      updateTableStatus(selectedTable.id, 'reserved');
      setIsBookingDialogOpen(false);
      setSelectedTable(null);
      setBookingData({
        customerName: '',
        customerPhone: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        partySize: '',
      });
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Table Management</h1>
        <p className="text-muted-foreground">Manage seating and reservations</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="stat-card-balance shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{freeCount}</p>
              <p className="text-sm text-muted-foreground">Free</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-expenses shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{occupiedCount}</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card-sales shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reservedCount}</p>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/30 border border-success" />
          <span className="text-muted-foreground">Free</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive" />
          <span className="text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/30 border border-warning" />
          <span className="text-muted-foreground">Reserved</span>
        </div>
      </div>

      {/* Table Grid */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Floor Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map((table) => (
              <Popover key={table.id}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => handleTableClick(table)}
                    className={cn(
                      'aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:scale-105',
                      table.status === 'free' && 'table-free',
                      table.status === 'occupied' && 'table-occupied',
                      table.status === 'reserved' && 'table-reserved'
                    )}
                  >
                    <span className="font-bold text-2xl">{table.number}</span>
                    <span className="text-xs opacity-80">{table.capacity} seats</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-2">
                    <div className="text-center pb-2 border-b">
                      <p className="font-semibold">Table {table.number}</p>
                      <p className="text-xs text-muted-foreground">{table.capacity} seats • {table.status}</p>
                    </div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-success hover:text-success"
                        onClick={() => handleStatusChange('free')}
                      >
                        Mark as Free
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => handleStatusChange('occupied')}
                      >
                        Mark as Occupied
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-warning hover:text-warning"
                        onClick={() => {
                          setSelectedTable(table);
                          setIsBookingDialogOpen(true);
                        }}
                      >
                        Add Reservation
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reservation</DialogTitle>
            <DialogDescription>
              Book Table {selectedTable?.number} for a customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={bookingData.customerName}
                onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={bookingData.customerPhone}
                onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partySize">Party Size</Label>
              <Input
                id="partySize"
                type="number"
                value={bookingData.partySize}
                onChange={(e) => setBookingData({ ...bookingData, partySize: e.target.value })}
                placeholder="Number of guests"
                max={selectedTable?.capacity}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookTable}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffSeating;
