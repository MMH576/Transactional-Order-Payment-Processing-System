import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private isTestMode: boolean;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    this.isTestMode =
      !secretKey || secretKey === 'sk_test_placeholder' || secretKey === '';
    this.stripe = new Stripe(secretKey || 'sk_test_placeholder', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    amount: number,
    orderId: string,
  ): Promise<Stripe.PaymentIntent> {
    // Convert to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Return mock payment intent for testing without real Stripe keys
    if (this.isTestMode) {
      return {
        id: `pi_test_${Date.now()}`,
        client_secret: `pi_test_${Date.now()}_secret_mock`,
        amount: amountInCents,
        currency: 'usd',
        status: 'requires_payment_method',
        metadata: { orderId },
      } as unknown as Stripe.PaymentIntent;
    }

    return this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET')!;

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
