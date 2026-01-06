import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
}

// Define ALL valid transitions
const VALID_TRANSITIONS: StateTransition[] = [
  { from: OrderStatus.CREATED, to: OrderStatus.PAYMENT_PENDING },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.PAID },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.FAILED },
  { from: OrderStatus.CREATED, to: OrderStatus.CANCELLED },
  { from: OrderStatus.PAID, to: OrderStatus.FULFILLED },
];

export class OrderStateMachine {
  /**
   * Validates if a state transition is allowed.
   * Throws BadRequestException if not allowed.
   */
  static validateTransition(from: OrderStatus, to: OrderStatus): void {
    const isValid = VALID_TRANSITIONS.some(
      (t) => t.from === from && t.to === to,
    );

    if (!isValid) {
      throw new BadRequestException(
        `Invalid order state transition: ${from} -> ${to}`,
      );
    }
  }

  /**
   * Returns all possible next states from current state.
   */
  static getNextStates(current: OrderStatus): OrderStatus[] {
    return VALID_TRANSITIONS.filter((t) => t.from === current).map((t) => t.to);
  }

  /**
   * Checks if an order can be cancelled.
   */
  static canCancel(status: OrderStatus): boolean {
    return status === OrderStatus.CREATED;
  }

  /**
   * Checks if an order is in a terminal state.
   */
  static isTerminal(status: OrderStatus): boolean {
    const terminalStates: OrderStatus[] = [
      OrderStatus.FULFILLED,
      OrderStatus.CANCELLED,
      OrderStatus.FAILED,
    ];
    return terminalStates.includes(status);
  }
}
