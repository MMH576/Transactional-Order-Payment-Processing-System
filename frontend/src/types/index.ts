export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Product {
  id: string;
  name: string;
  price: string;
  metadata: Record<string, any>;
  inventory?: {
    availableQuantity: number;
    reservedQuantity?: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceSnapshot: string;
  product: {
    name: string;
  };
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  paymentIntentId?: string;
  orderItems: OrderItem[];
  user?: {
    email: string;
  };
}

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'FAILED';

export interface AuditLog {
  id: string;
  actorId?: string;
  actionType: string;
  entityType: string;
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  timestamp: string;
  actor?: {
    email: string;
  };
}

export interface Inventory {
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  product: {
    id: string;
    name: string;
    price: string;
  };
}

export interface CheckoutResponse {
  orderId: string;
  clientSecret: string;
  totalAmount: number;
}
