import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from '../push-subscription/schemas/push-subscription.schema';
import { NotificationService } from './notification.service';
import {
  NotificationLog,
  NotificationLogSchema,
} from './schemas/notification-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
  ],
  providers: [NotificationService],
  exports: [NotificationService, MongooseModule],
})
export class NotificationModule {}
