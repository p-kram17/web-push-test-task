import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from '../queue/queue.module';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    QueueModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService, MongooseModule],
})
export class CampaignModule {}
