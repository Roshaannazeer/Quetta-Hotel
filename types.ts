
export interface MenuItem {
  id: string;
  name: string;
  nameUrdu?: string;
  price: number;
  category: string;
  barcode?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
  username: string;
  password?: string; // Added for security
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  discount: number;
  timestamp: Date;
  cashier: string;
  customerName: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  itemName: string;
  quantity: number;
  purchasePrice: number;
  date: Date;
}

export type ViewState = 'LOGIN' | 'HOME' | 'POS' | 'DASHBOARD' | 'MENU' | 'CATEGORY' | 'SUPPLIER' | 'PURCHASE' | 'PURCHASE_RETURN';
