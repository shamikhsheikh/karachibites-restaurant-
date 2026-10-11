export interface MenuItem {
  id: number;
  name: string;
  category: 'BBQ' | 'KARAHI' | 'RICE' | 'ROLLS' | 'DRINKS' | 'DESSERTS';
  price: number;
  tags: string[];
  available: boolean;
  description: string;
  image: string;
}

export interface CartItem {
  menuItem: MenuItem;
  qty: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export type OrderStatus = 'Received' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  orderId: string;
  customer: Customer;
  branch: 'Clifton' | 'Gulshan-e-Iqbal' | 'North Nazimabad';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
