// Base URL configuration for the restaurant management system

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  
  // Superadmin routes
  SUPERADMIN: {
    DASHBOARD: '/superadmin/dashboard',
    PACKAGES: '/superadmin/packages',
    USERS: '/superadmin/users',
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    EXPENSES: '/admin/expenses',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  },
  
  // Staff routes
  STAFF: {
    POS: '/staff/pos',
    ORDERS: '/staff/orders',
    FOOD: '/staff/food',
    SEATING: '/staff/seating',
    KITCHEN: '/staff/kitchen',
  },
} as const;

export const getDefaultRoute = (role: 'admin' | 'staff' | 'superadmin') => {
  if (role === 'superadmin') return ROUTES.SUPERADMIN.DASHBOARD;
  return role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.STAFF.POS;
};
