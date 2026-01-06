import { OrderStateMachine } from '../../src/orders/order-state-machine';
import { OrderStatus } from '@prisma/client';

describe('OrderStateMachine', () => {
  describe('validateTransition', () => {
    it('should allow CREATED → PAYMENT_PENDING', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.CREATED,
          OrderStatus.PAYMENT_PENDING,
        ),
      ).not.toThrow();
    });

    it('should allow PAYMENT_PENDING → PAID', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.PAYMENT_PENDING,
          OrderStatus.PAID,
        ),
      ).not.toThrow();
    });

    it('should allow PAYMENT_PENDING → FAILED', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.PAYMENT_PENDING,
          OrderStatus.FAILED,
        ),
      ).not.toThrow();
    });

    it('should allow CREATED → CANCELLED', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.CREATED,
          OrderStatus.CANCELLED,
        ),
      ).not.toThrow();
    });

    it('should allow PAID → FULFILLED', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.PAID,
          OrderStatus.FULFILLED,
        ),
      ).not.toThrow();
    });

    it('should NOT allow CREATED → PAID (skipping step)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.CREATED,
          OrderStatus.PAID,
        ),
      ).toThrow('Invalid order state transition');
    });

    it('should NOT allow PAID → CREATED (backwards)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.PAID,
          OrderStatus.CREATED,
        ),
      ).toThrow('Invalid order state transition');
    });

    it('should NOT allow FULFILLED → any state (terminal)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.FULFILLED,
          OrderStatus.CANCELLED,
        ),
      ).toThrow();
    });

    it('should NOT allow CANCELLED → any state (terminal)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.CANCELLED,
          OrderStatus.CREATED,
        ),
      ).toThrow();
    });

    it('should NOT allow FAILED → any state (terminal)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.FAILED,
          OrderStatus.PAYMENT_PENDING,
        ),
      ).toThrow();
    });
  });

  describe('getNextStates', () => {
    it('should return correct next states for CREATED', () => {
      const nextStates = OrderStateMachine.getNextStates(OrderStatus.CREATED);
      expect(nextStates).toContain(OrderStatus.PAYMENT_PENDING);
      expect(nextStates).toContain(OrderStatus.CANCELLED);
      expect(nextStates).not.toContain(OrderStatus.PAID);
      expect(nextStates).not.toContain(OrderStatus.FULFILLED);
    });

    it('should return correct next states for PAYMENT_PENDING', () => {
      const nextStates = OrderStateMachine.getNextStates(
        OrderStatus.PAYMENT_PENDING,
      );
      expect(nextStates).toContain(OrderStatus.PAID);
      expect(nextStates).toContain(OrderStatus.FAILED);
      expect(nextStates).not.toContain(OrderStatus.CREATED);
    });

    it('should return correct next states for PAID', () => {
      const nextStates = OrderStateMachine.getNextStates(OrderStatus.PAID);
      expect(nextStates).toContain(OrderStatus.FULFILLED);
      expect(nextStates).toHaveLength(1);
    });

    it('should return empty array for terminal states', () => {
      expect(OrderStateMachine.getNextStates(OrderStatus.FULFILLED)).toHaveLength(0);
      expect(OrderStateMachine.getNextStates(OrderStatus.CANCELLED)).toHaveLength(0);
      expect(OrderStateMachine.getNextStates(OrderStatus.FAILED)).toHaveLength(0);
    });
  });

  describe('canCancel', () => {
    it('should return true for CREATED status', () => {
      expect(OrderStateMachine.canCancel(OrderStatus.CREATED)).toBe(true);
    });

    it('should return false for PAYMENT_PENDING status', () => {
      expect(OrderStateMachine.canCancel(OrderStatus.PAYMENT_PENDING)).toBe(false);
    });

    it('should return false for PAID status', () => {
      expect(OrderStateMachine.canCancel(OrderStatus.PAID)).toBe(false);
    });

    it('should return false for FULFILLED status', () => {
      expect(OrderStateMachine.canCancel(OrderStatus.FULFILLED)).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it('should return true for FULFILLED', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.FULFILLED)).toBe(true);
    });

    it('should return true for CANCELLED', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.CANCELLED)).toBe(true);
    });

    it('should return true for FAILED', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.FAILED)).toBe(true);
    });

    it('should return false for CREATED', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.CREATED)).toBe(false);
    });

    it('should return false for PAYMENT_PENDING', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.PAYMENT_PENDING)).toBe(false);
    });

    it('should return false for PAID', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.PAID)).toBe(false);
    });
  });
});
