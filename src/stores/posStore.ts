import { create } from 'zustand';
import type { MenuItem, OrderItem, Table, SavedOrder, Invoice, PaymentMethod } from '@/types';

interface POSState {
  selectedTable: Table | null;
  cartItems: OrderItem[];
  savedOrders: SavedOrder[];
  invoices: Invoice[];
  tokenCounter: number;
  
  setSelectedTable: (table: Table | null) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // Billing
  saveOrder: (tableNumber: number) => SavedOrder;
  getSavedOrderByPosNumber: (posNumber: string) => SavedOrder | undefined;
  generateInvoice: (orderId: string, paymentMethod: PaymentMethod) => Invoice;
  generateDirectInvoice: (items: OrderItem[], tableNumber: number, paymentMethod: PaymentMethod) => Invoice;
  markInvoicePaid: (invoiceId: string) => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
  selectedTable: null,
  cartItems: [],
  savedOrders: [],
  invoices: [],
  tokenCounter: 1000,

  setSelectedTable: (table) => set({ selectedTable: table }),

  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cartItems.find(
        (cartItem) => cartItem.menuItem.id === item.id
      );

      if (existingItem) {
        return {
          cartItems: state.cartItems.map((cartItem) =>
            cartItem.menuItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        };
      }

      return {
        cartItems: [...state.cartItems, { menuItem: item, quantity: 1 }],
      };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cartItems: state.cartItems.filter(
        (cartItem) => cartItem.menuItem.id !== itemId
      ),
    })),

  updateQuantity: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          cartItems: state.cartItems.filter(
            (cartItem) => cartItem.menuItem.id !== itemId
          ),
        };
      }

      return {
        cartItems: state.cartItems.map((cartItem) =>
          cartItem.menuItem.id === itemId
            ? { ...cartItem, quantity }
            : cartItem
        ),
      };
    }),

  clearCart: () => set({ cartItems: [], selectedTable: null }),

  getCartTotal: () => {
    const state = get();
    return state.cartItems.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  },

  getCartItemCount: () => {
    const state = get();
    return state.cartItems.reduce((count, item) => count + item.quantity, 0);
  },

  saveOrder: (tableNumber) => {
    const state = get();
    const subtotal = state.getCartTotal();
    const gst = subtotal * 0.1;
    const posNumber = `POS${Date.now().toString().slice(-6)}`;
    
    const savedOrder: SavedOrder = {
      id: `so${Date.now()}`,
      posNumber,
      tableNumber,
      items: [...state.cartItems],
      subtotal,
      gst,
      total: subtotal + gst,
      createdAt: new Date(),
      isPaid: false,
    };

    set((s) => ({
      savedOrders: [...s.savedOrders, savedOrder],
      cartItems: [],
      selectedTable: null,
    }));

    return savedOrder;
  },

  getSavedOrderByPosNumber: (posNumber) => {
    const state = get();
    return state.savedOrders.find(
      (order) => order.posNumber.toLowerCase() === posNumber.toLowerCase() && !order.isPaid
    );
  },

  generateInvoice: (orderId, paymentMethod) => {
    const state = get();
    const order = state.savedOrders.find((o) => o.id === orderId);
    
    if (!order) throw new Error('Order not found');

    const invoice: Invoice = {
      id: `INV${Date.now()}`,
      tokenNumber: state.tokenCounter + 1,
      orderId: order.id,
      tableNumber: order.tableNumber,
      items: order.items,
      subtotal: order.subtotal,
      gst: order.gst,
      total: order.total,
      paymentMethod,
      createdAt: new Date(),
      isPaid: true,
    };

    set((s) => ({
      invoices: [...s.invoices, invoice],
      tokenCounter: s.tokenCounter + 1,
      savedOrders: s.savedOrders.map((o) =>
        o.id === orderId ? { ...o, isPaid: true } : o
      ),
    }));

    return invoice;
  },

  generateDirectInvoice: (items, tableNumber, paymentMethod) => {
    const state = get();
    const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const gst = subtotal * 0.1;

    const invoice: Invoice = {
      id: `INV${Date.now()}`,
      tokenNumber: state.tokenCounter + 1,
      orderId: `direct-${Date.now()}`,
      tableNumber,
      items,
      subtotal,
      gst,
      total: subtotal + gst,
      paymentMethod,
      createdAt: new Date(),
      isPaid: true,
    };

    set((s) => ({
      invoices: [...s.invoices, invoice],
      tokenCounter: s.tokenCounter + 1,
      cartItems: [],
      selectedTable: null,
    }));

    return invoice;
  },

  markInvoicePaid: (invoiceId) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, isPaid: true } : inv
      ),
    })),
}));
