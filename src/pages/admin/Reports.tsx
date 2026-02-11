import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminReports = () => {
  const reportTypes = [
    { 
      title: 'Daily Sales Report', 
      description: 'Complete breakdown of today\'s sales and transactions',
      icon: FileText,
    },
    { 
      title: 'Weekly Summary', 
      description: 'Weekly performance metrics and comparisons',
      icon: Calendar,
    },
    { 
      title: 'Monthly Financial Report', 
      description: 'Detailed P&L statement for the current month',
      icon: FileText,
    },
    { 
      title: 'Expense Analysis', 
      description: 'Category-wise expense breakdown and trends',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate and download financial reports</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report, index) => (
          <Card key={index} className="shadow-soft hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Advanced Analytics Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mt-2">
            We're working on advanced analytics with customizable date ranges, 
            interactive charts, and exportable data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
