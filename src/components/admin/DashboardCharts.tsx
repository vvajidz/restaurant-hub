import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for charts
const dailySalesData = [
  { day: 'Mon', sales: 2400 },
  { day: 'Tue', sales: 1398 },
  { day: 'Wed', sales: 3200 },
  { day: 'Thu', sales: 2780 },
  { day: 'Fri', sales: 4890 },
  { day: 'Sat', sales: 5390 },
  { day: 'Sun', sales: 4490 },
];

const weeklySalesData = [
  { week: 'Week 1', sales: 15000 },
  { week: 'Week 2', sales: 18500 },
  { week: 'Week 3', sales: 21000 },
  { week: 'Week 4', sales: 19200 },
];

const paymentModeData = [
  { name: 'Cash', value: 35, color: 'hsl(35, 91%, 50%)' },
  { name: 'Card', value: 45, color: 'hsl(199, 89%, 48%)' },
  { name: 'UPI', value: 15, color: 'hsl(142, 71%, 45%)' },
  { name: 'Other', value: 5, color: 'hsl(280, 65%, 60%)' },
];

export const SalesLineChart = () => (
  <Card className="shadow-soft">
    <CardHeader>
      <CardTitle className="text-base">Daily Sales</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={dailySalesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="day" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value}`, 'Sales']}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const SalesBarChart = () => (
  <Card className="shadow-soft">
    <CardHeader>
      <CardTitle className="text-base">Weekly Sales</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={weeklySalesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="week" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
          />
          <Bar 
            dataKey="sales" 
            fill="hsl(var(--chart-2))" 
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const PaymentPieChart = () => (
  <Card className="shadow-soft">
    <CardHeader>
      <CardTitle className="text-base">Payment Methods</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={paymentModeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {paymentModeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value}%`, 'Share']}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
