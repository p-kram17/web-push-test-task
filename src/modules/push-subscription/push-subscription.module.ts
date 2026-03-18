import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from './schemas/push-subscription.schema';
import { PushSubscriptionController } from './push-subscription.controller';
import { PushSubscriptionService } from './push-subscription.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
    ]),
  ],
  controllers: [PushSubscriptionController],
  providers: [PushSubscriptionService],
  exports: [PushSubscriptionService, MongooseModule],
})
export class PushSubscriptionModule {}
