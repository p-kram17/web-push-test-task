import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from '../push-subscription/schemas/push-subscription.schema';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PushEvent, PushEventSchema } from './schemas/push-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PushEvent.name, schema: PushEventSchema },
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
