import { DollarSign, ShoppingCart, TrendingDown } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { SalesLineChart, SalesBarChart } from '@/components/admin/DashboardCharts';

const AdminDashboard = () => {
  // Mock data - would come from API/store in real app
  const stats = {
    todaySales: 2847.50,
    ordersCount: 42,
    expensesToday: 580,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Today's Sales"
          value={`$${stats.todaySales.toLocaleString()}`}
          subtitle="Total revenue today"
          icon={DollarSign}
          variant="sales"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Orders Count"
          value={stats.ordersCount.toString()}
          subtitle="Orders processed"
          icon={ShoppingCart}
          variant="orders"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Expenses Today"
          value={`$${stats.expensesToday.toLocaleString()}`}
          subtitle="Total expenses"
          icon={TrendingDown}
          variant="expenses"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesLineChart />
        <SalesBarChart />
      </div>
    </div>
  );
};

export default AdminDashboard;
