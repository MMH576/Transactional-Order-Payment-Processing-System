import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StripeWebhookController } from './stripe-webhook.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [PaymentsService],
  controllers: [StripeWebhookController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
