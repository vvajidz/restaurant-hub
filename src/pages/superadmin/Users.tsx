import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ban, CheckCircle, Building2, Mail, UserCog } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface HotelDetail {
  id: string;
  name: string;
  admin_user_id: string;
  staff_user_id: string | null;
  staff_email: string | null;
  status: string;
  created_at: string;
}

const SuperadminUsers = () => {
  const [hotels, setHotels] = useState<HotelDetail[]>([]);
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<{ hotelId: string; action: 'block' | 'unblock' } | null>(null);

  const fetchHotels = async () => {
    const { data } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
    const hotelList = (data || []) as HotelDetail[];
    setHotels(hotelList);

    // Fetch admin names
    const adminIds = hotelList.map(h => h.admin_user_id);
    if (adminIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', adminIds);
      const nameMap: Record<string, string> = {};
      profiles?.forEach((p: any) => { nameMap[p.user_id] = p.name; });
      setAdminNames(nameMap);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleToggleStatus = async () => {
    if (!confirmAction) return;
    const newStatus = confirmAction.action === 'block' ? 'blocked' : 'active';
    const { error } = await supabase.from('hotels').update({ status: newStatus }).eq('id', confirmAction.hotelId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Hotel ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
    setConfirmAction(null);
    fetchHotels();
  };

  const activeCount = hotels.filter(h => h.status === 'active').length;
  const blockedCount = hotels.filter(h => h.status === 'blocked').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage hotel accounts and access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hotels</p>
                <p className="text-2xl font-bold">{hotels.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-destructive">{blockedCount}</p>
              </div>
              <Ban className="w-8 h-8 text-destructive opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" /> All Hotel Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Staff Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((hotel) => (
                <TableRow key={hotel.id} className={hotel.status === 'blocked' ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      {adminNames[hotel.admin_user_id] || '—'}
                    </div>
                  </TableCell>
                  <TableCell>{hotel.staff_email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={hotel.status === 'active' ? 'secondary' : 'destructive'}>
                      {hotel.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(hotel.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {hotel.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setConfirmAction({ hotelId: hotel.id, action: 'block' })}
                      >
                        <Ban className="w-3 h-3 mr-1" /> Block
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmAction({ hotelId: hotel.id, action: 'unblock' })}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Unblock
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {hotels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">No hotels found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'block' ? 'Block Hotel?' : 'Unblock Hotel?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'block'
                ? 'This will prevent the hotel admin and staff from accessing the platform.'
                : 'This will restore access for the hotel admin and staff.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {confirmAction?.action === 'block' ? 'Block' : 'Unblock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperadminUsers;
