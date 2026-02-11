import { create } from 'zustand';
import type { MenuItem, Table, Order, Expense, RestaurantSettings } from '@/types';

// Mock data
const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Margherita Pizza', price: 14.99, category: 'Pizza', available: true, description: 'Fresh tomatoes, mozzarella, basil' },
  { id: '2', name: 'Pepperoni Pizza', price: 16.99, category: 'Pizza', available: true, description: 'Classic pepperoni with cheese' },
  { id: '3', name: 'Caesar Salad', price: 9.99, category: 'Salads', available: true, description: 'Romaine, croutons, parmesan' },
  { id: '4', name: 'Greek Salad', price: 10.99, category: 'Salads', available: true, description: 'Feta, olives, cucumbers' },
  { id: '5', name: 'Spaghetti Carbonara', price: 15.99, category: 'Pasta', available: true, description: 'Creamy egg sauce, pancetta' },
  { id: '6', name: 'Fettuccine Alfredo', price: 14.99, category: 'Pasta', available: true, description: 'Rich cream sauce' },
  { id: '7', name: 'Grilled Salmon', price: 22.99, category: 'Mains', available: true, description: 'Atlantic salmon, herbs' },
  { id: '8', name: 'Ribeye Steak', price: 28.99, category: 'Mains', available: true, description: '12oz prime cut' },
  { id: '9', name: 'Tiramisu', price: 7.99, category: 'Desserts', available: true, description: 'Coffee-soaked ladyfingers' },
  { id: '10', name: 'Cheesecake', price: 6.99, category: 'Desserts', available: true, description: 'New York style' },
  { id: '11', name: 'Coca Cola', price: 2.99, category: 'Beverages', available: true },
  { id: '12', name: 'Fresh Lemonade', price: 3.99, category: 'Beverages', available: true },
];

const MOCK_TABLES: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'free' },
  { id: 't2', number: 2, capacity: 2, status: 'occupied' },
  { id: 't3', number: 3, capacity: 4, status: 'free' },
  { id: 't4', number: 4, capacity: 4, status: 'reserved' },
  { id: 't5', number: 5, capacity: 6, status: 'free' },
  { id: 't6', number: 6, capacity: 6, status: 'occupied' },
  { id: 't7', number: 7, capacity: 8, status: 'free' },
  { id: 't8', number: 8, capacity: 4, status: 'free' },
  { id: 't9', number: 9, capacity: 2, status: 'occupied' },
  { id: 't10', number: 10, capacity: 4, status: 'free' },
  { id: 't11', number: 11, capacity: 6, status: 'reserved' },
  { id: 't12', number: 12, capacity: 8, status: 'free' },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    tableId: 't2',
    items: [
      { menuItem: MOCK_MENU_ITEMS[0], quantity: 2 },
      { menuItem: MOCK_MENU_ITEMS[10], quantity: 2 },
    ],
    status: 'preparing',
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(),
    total: 35.96,
  },
  {
    id: 'o2',
    tableId: 't6',
    items: [
      { menuItem: MOCK_MENU_ITEMS[6], quantity: 1 },
      { menuItem: MOCK_MENU_ITEMS[2], quantity: 2 },
    ],
    status: 'new',
    createdAt: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(),
    total: 42.97,
  },
  {
    id: 'o3',
    tableId: 't9',
    items: [
      { menuItem: MOCK_MENU_ITEMS[7], quantity: 2 },
      { menuItem: MOCK_MENU_ITEMS[8], quantity: 2 },
    ],
    status: 'ready',
    createdAt: new Date(Date.now() - 25 * 60000),
    updatedAt: new Date(),
    total: 73.96,
  },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', title: 'Weekly vegetables', category: 'ingredients', amount: 450, date: new Date(), notes: 'Fresh produce delivery', createdBy: '1' },
  { id: 'e2', title: 'Electricity bill', category: 'utilities', amount: 280, date: new Date(), createdBy: '1' },
  { id: 'e3', title: 'Kitchen repair', category: 'maintenance', amount: 150, date: new Date(Date.now() - 86400000), createdBy: '1' },
  { id: 'e4', title: 'Staff uniforms', category: 'other', amount: 200, date: new Date(Date.now() - 86400000 * 2), createdBy: '1' },
];

interface RestaurantState {
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  expenses: Expense[];
  settings: RestaurantSettings;
  
  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Table actions
  updateTableStatus: (id: string, status: Table['status']) => void;
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<RestaurantSettings>) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  menuItems: MOCK_MENU_ITEMS,
  tables: MOCK_TABLES,
  orders: MOCK_ORDERS,
  expenses: MOCK_EXPENSES,
  settings: {
    name: 'La Bella Italia',
    address: '123 Main Street, City',
    phone: '+1 234 567 890',
    email: 'info@labellaItalia.com',
    taxRate: 10,
    currency: 'USD',
    invoiceFooter: 'Thank you for dining with us!',
    features: {
      enableReservations: true,
      enableKitchenDisplay: true,
      enableTableService: true,
    },
  },

  addMenuItem: (item) =>
    set((state) => ({
      menuItems: [...state.menuItems, { ...item, id: `m${Date.now()}` }],
    })),

  updateMenuItem: (id, updates) =>
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  deleteMenuItem: (id) =>
    set((state) => ({
      menuItems: state.menuItems.filter((item) => item.id !== id),
    })),

  updateTableStatus: (id, status) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === id ? { ...table, status } : table
      ),
    })),

  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: `o${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status, updatedAt: new Date() } : order
      ),
    })),

  addExpense: (expense) =>
    set((state) => ({
      expenses: [...state.expenses, { ...expense, id: `e${Date.now()}` }],
    })),

  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
}));
