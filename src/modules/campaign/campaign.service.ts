import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueueService } from '../queue/queue.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    private readonly queueService: QueueService,
  ) {}

  async create(createDto: CreateCampaignDto) {
    const campaign = await this.campaignModel.create(createDto);
    await this.queueService.enqueueCampaign(campaign._id.toString());

    this.logger.log(`Campaign ${campaign._id.toString()} created and queued`);

    return campaign.toObject();
  }

  async findById(campaignId: string) {
    const campaign = await this.campaignModel
      .findById(campaignId)
      .lean()
      .exec();

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    return campaign;
  }
}
