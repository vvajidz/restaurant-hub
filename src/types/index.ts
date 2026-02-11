// Core types for the restaurant management system

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'new' | 'preparing' | 'ready' | 'served' | 'paid';
  createdAt: Date;
  updatedAt: Date;
  total: number;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  currentOrder?: Order;
  reservation?: Reservation;
}

export interface Reservation {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  date: Date;
  time: string;
  partySize: number;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  notes?: string;
  createdBy: string;
}

export type ExpenseCategory = 
  | 'ingredients'
  | 'utilities'
  | 'salaries'
  | 'maintenance'
  | 'marketing'
  | 'equipment'
  | 'other';

export interface DailySales {
  date: string;
  total: number;
  orders: number;
}

export interface PaymentMode {
  name: string;
  value: number;
  color: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi';

export interface Invoice {
  id: string;
  tokenNumber: number;
  orderId: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  isPaid: boolean;
}

export interface SavedOrder {
  id: string;
  posNumber: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  createdAt: Date;
  isPaid: boolean;
}

export interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  invoiceFooter: string;
  features: {
    enableReservations: boolean;
    enableKitchenDisplay: boolean;
    enableTableService: boolean;
  };
}
