import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface SubPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

const SuperadminPackages = () => {
  const [packages, setPackages] = useState<SubPackage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubPackage | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', duration_days: '30', features: '', is_active: true,
  });

  const fetchPackages = async () => {
    const { data } = await supabase.from('subscription_packages').select('*').order('price');
    setPackages((data || []) as SubPackage[]);
  };

  useEffect(() => { fetchPackages(); }, []);

  const openDialog = (pkg?: SubPackage) => {
    if (pkg) {
      setEditing(pkg);
      setForm({
        name: pkg.name,
        description: pkg.description || '',
        price: pkg.price.toString(),
        duration_days: pkg.duration_days.toString(),
        features: (pkg.features || []).join(', '),
        is_active: pkg.is_active,
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', price: '', duration_days: '30', features: '', is_active: true });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      duration_days: parseInt(form.duration_days),
      features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      is_active: form.is_active,
    };

    if (editing) {
      const { error } = await supabase.from('subscription_packages').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Package updated');
    } else {
      const { error } = await supabase.from('subscription_packages').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Package created');
    }
    setIsDialogOpen(false);
    fetchPackages();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('subscription_packages').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Package deleted');
    fetchPackages();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Subscription Packages</h1>
          <p className="text-muted-foreground">Manage subscription plans for hotels</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {pkg.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                </div>
                <Badge variant={pkg.is_active ? 'secondary' : 'destructive'}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold">₹{pkg.price}<span className="text-sm font-normal text-muted-foreground">/{pkg.duration_days} days</span></div>
              <div className="flex flex-wrap gap-1">
                {(pkg.features || []).map((f, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openDialog(pkg)}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(pkg.id)}>
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Pro" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input type="number" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (comma-separated)</Label>
              <Input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="POS, Orders, Kitchen Display" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperadminPackages;
