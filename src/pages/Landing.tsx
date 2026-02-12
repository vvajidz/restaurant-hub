import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  UtensilsCrossed, LayoutDashboard, ShoppingCart, ChefHat, Users,
  BarChart3, Settings, CreditCard, ArrowRight, CheckCircle2,
  Monitor, Smartphone, Shield, Zap, ClipboardList, TableProperties
} from 'lucide-react';
import { ROUTES } from '@/config/urls';

const adminFeatures = [
  { icon: LayoutDashboard, title: 'Smart Dashboard', desc: 'Real-time overview of sales, orders, expenses, and revenue with interactive charts.' },
  { icon: UtensilsCrossed, title: 'Menu Management', desc: 'Add, edit, delete, and toggle availability of menu items with categories and pricing.' },
  { icon: TableProperties, title: 'Table Management', desc: 'Configure table count, capacity, and naming to match your restaurant layout.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Detailed sales reports, expense breakdowns, and revenue trends over time.' },
  { icon: CreditCard, title: 'Expense Tracking', desc: 'Track all restaurant expenses by category — ingredients, utilities, salaries, and more.' },
  { icon: Settings, title: 'Settings & Staff', desc: 'Configure restaurant details, tax rates, and view staff account credentials.' },
];

const staffFeatures = [
  { icon: ShoppingCart, title: 'Point of Sale (POS)', desc: 'Fast, intuitive POS system for taking orders with category-based menu browsing.' },
  { icon: ClipboardList, title: 'Order Management', desc: 'View and manage all active orders with real-time status updates.' },
  { icon: ChefHat, title: 'Kitchen Display', desc: 'Live kitchen screen showing incoming orders with preparation status tracking.' },
  { icon: Monitor, title: 'Seating Overview', desc: 'Visual table layout showing free, occupied, and reserved tables at a glance.' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-serif text-foreground">RestroCloud</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#admin" className="hover:text-foreground transition-colors">For Owners</a>
            <a href="#staff" className="hover:text-foreground transition-colors">For Staff</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/register')}>
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Built for modern restaurants & hotels
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-foreground leading-tight">
              Manage Your Restaurant
              <span className="block text-primary mt-2">Like Never Before</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A complete cloud-based restaurant management platform. From POS and kitchen display to analytics and expense tracking — everything your hotel needs, in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 py-6" onClick={() => navigate('/register')}>
                Create Your Hotel Account <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6" onClick={() => navigate(ROUTES.LOGIN)}>
                Sign In to Dashboard
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary" /> Free to start</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-primary" /> Secure & private</span>
              <span className="flex items-center gap-1"><Smartphone className="w-4 h-4 text-primary" /> Works on all devices</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground text-lg">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Hotel Account', desc: 'Sign up with your hotel name, admin email, and set up a staff account — all in one form.' },
              { step: '02', title: 'Set Up Your Menu & Tables', desc: 'Add your restaurant menu items and configure your table layout from the admin dashboard.' },
              { step: '03', title: 'Start Taking Orders', desc: 'Give your staff their login credentials and start processing orders immediately.' },
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-8">
                  <span className="text-5xl font-bold text-primary/10 font-mono absolute top-4 right-6">{item.step}</span>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section id="admin" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Users className="w-4 h-4" /> For Hotel Owners / Admin
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">Complete Admin Dashboard</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Full control over your restaurant operations — menu, tables, expenses, reports, and staff management.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((f) => (
              <Card key={f.title} className="group hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Features */}
      <section id="staff" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              <ChefHat className="w-4 h-4" /> For Staff Members
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">Powerful Staff Tools</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Your staff gets a dedicated account with POS, order management, kitchen display, and seating overview.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {staffFeatures.map((f) => (
              <Card key={f.title} className="group hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <f.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">Simple Pricing</h2>
            <p className="mt-4 text-muted-foreground text-lg">Start free, upgrade when you grow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: 'Free', desc: 'Perfect for trying out', features: ['1 Hotel Account', '1 Staff Account', 'Up to 20 Menu Items', 'Basic Reports'] },
              { name: 'Professional', price: '$29/mo', desc: 'For growing restaurants', features: ['Everything in Starter', 'Unlimited Menu Items', 'Advanced Analytics', 'Priority Support'], popular: true },
              { name: 'Enterprise', price: 'Custom', desc: 'For hotel chains', features: ['Everything in Pro', 'Multiple Locations', 'Custom Integrations', 'Dedicated Support'] },
            ].map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                  <ul className="mt-6 space-y-3 text-sm text-left">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-8"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Ready to streamline your restaurant?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Create your hotel account now and start managing orders, menu, and staff in minutes.
          </p>
          <Button size="lg" className="mt-8 text-base px-8 py-6" onClick={() => navigate('/register')}>
            Create Hotel Account <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <span className="font-serif font-semibold text-foreground">RestroCloud</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 RestroCloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
