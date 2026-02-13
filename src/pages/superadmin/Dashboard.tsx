import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface HotelInfo {
  id: string;
  name: string;
  created_at: string;
  staff_email: string | null;
  admin_user_id: string;
  status: string;
  subscription_package_id: string | null;
  subscription_end: string | null;
}

const SuperadminDashboard = () => {
  const [hotels, setHotels] = useState<HotelInfo[]>([]);
  const [adminEmails, setAdminEmails] = useState<Record<string, string>>({});
  const [packageNames, setPackageNames] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ hotels: 0, orders: 0, revenue: 0, users: 0, packages: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const [hotelsRes, ordersRes, profilesRes, packagesRes] = await Promise.all([
        supabase.from('hotels').select('*'),
        supabase.from('orders').select('total'),
        supabase.from('profiles').select('id'),
        supabase.from('subscription_packages').select('*'),
      ]);

      const hotelList = (hotelsRes.data || []) as HotelInfo[];
      const orders = ordersRes.data || [];
      const profiles = profilesRes.data || [];
      const packages = packagesRes.data || [];
      const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

      // Build package name map
      const pkgMap: Record<string, string> = {};
      packages.forEach((p: any) => { pkgMap[p.id] = p.name; });
      setPackageNames(pkgMap);

      // Fetch admin emails from profiles
      const adminIds = hotelList.map(h => h.admin_user_id);
      if (adminIds.length > 0) {
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', adminIds);
        
        const emailMap: Record<string, string> = {};
        // We need to get emails from auth - use profiles name as fallback
        if (adminProfiles) {
          adminProfiles.forEach((p: any) => { emailMap[p.user_id] = p.name; });
        }
        setAdminEmails(emailMap);
      }

      setHotels(hotelList);
      setStats({
        hotels: hotelList.length,
        orders: orders.length,
        revenue,
        users: profiles.length,
        packages: packages.length,
      });
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Hotels', value: stats.hotels, icon: Building2, color: 'text-primary' },
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500' },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-green-500' },
    { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500' },
    { title: 'Packages', value: stats.packages, icon: Package, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground">Monitor all hotels and platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hotels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Staff Email</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Subscription End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell>{adminEmails[hotel.admin_user_id] || '—'}</TableCell>
                  <TableCell>{hotel.staff_email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {hotel.subscription_package_id ? packageNames[hotel.subscription_package_id] || 'Unknown' : 'None'}
                    </Badge>
                  </TableCell>
                  <TableCell>{hotel.subscription_end ? new Date(hotel.subscription_end).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={hotel.status === 'active' ? 'secondary' : 'destructive'}>
                      {hotel.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(hotel.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {hotels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No hotels registered yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperadminDashboard;
