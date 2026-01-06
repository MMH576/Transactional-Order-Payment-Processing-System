import { Role, OrderStatus, ActionType, EntityType } from '@prisma/client';

export { Role, OrderStatus, ActionType, EntityType };

// Extend Express Request to include rawBody for Stripe webhook verification
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// Order State Machine Types
export interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
}

export const VALID_TRANSITIONS: StateTransition[] = [
  { from: OrderStatus.CREATED, to: OrderStatus.PAYMENT_PENDING },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.PAID },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.FAILED },
  { from: OrderStatus.CREATED, to: OrderStatus.CANCELLED },
  { from: OrderStatus.PAID, to: OrderStatus.FULFILLED },
];

// Checkout Types
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CheckoutResult {
  orderId: string;
  clientSecret: string;
  totalAmount: number;
}

// Audit Log Types
export interface AuditLogData {
  actorId?: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
}
