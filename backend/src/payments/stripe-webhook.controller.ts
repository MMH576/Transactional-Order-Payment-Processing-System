import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private paymentsService: PaymentsService,
    private ordersService: OrdersService,
  ) {}

  @Post('stripe')
  @Public() // Webhooks don't use JWT auth
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      // CRITICAL: Verify webhook signature
      // This ensures the request actually came from Stripe
      event = this.paymentsService.constructWebhookEvent(
        req.rawBody as Buffer,
        signature,
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${(err as Error).message}`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      this.logger.warn('PaymentIntent missing orderId metadata');
      return;
    }

    this.logger.log(`Processing payment success for order: ${orderId}`);

    try {
      await this.ordersService.handlePaymentSuccess(orderId);
      this.logger.log(`Order ${orderId} marked as PAID`);
    } catch (error) {
      this.logger.error(
        `Failed to process payment success: ${(error as Error).message}`,
      );
      // Don't throw - we don't want to fail the webhook
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      this.logger.warn('PaymentIntent missing orderId metadata');
      return;
    }

    this.logger.log(`Processing payment failure for order: ${orderId}`);

    try {
      await this.ordersService.handlePaymentFailure(orderId);
      this.logger.log(`Order ${orderId} marked as FAILED, inventory released`);
    } catch (error) {
      this.logger.error(
        `Failed to process payment failure: ${(error as Error).message}`,
      );
    }
  }
}
