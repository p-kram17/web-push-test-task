import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
} from '../campaign/schemas/campaign.schema';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from '../push-subscription/schemas/push-subscription.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { PushEvent, PushEventDocument } from './schemas/push-event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(PushEvent.name)
    private readonly pushEventModel: Model<PushEventDocument>,
    @InjectModel(PushSubscription.name)
    private readonly pushSubscriptionModel: Model<PushSubscriptionDocument>,
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  async create(createDto: CreateEventDto) {
    const campaignExists = await this.campaignModel.exists({
      _id: new Types.ObjectId(createDto.campaignId),
    });

    if (!campaignExists) {
      throw new NotFoundException(`Campaign ${createDto.campaignId} not found`);
    }

    const subscriptionId = await this.resolveSubscriptionId(createDto);

    const event = await this.pushEventModel.create({
      type: createDto.type,
      campaignId: new Types.ObjectId(createDto.campaignId),
      subscriptionId,
    });

    return event.toObject();
  }

  private async resolveSubscriptionId(createDto: CreateEventDto) {
    if (createDto.subscriptionId) {
      const exists = await this.pushSubscriptionModel.exists({
        _id: new Types.ObjectId(createDto.subscriptionId),
      });

      if (!exists) {
        throw new NotFoundException(
          `Subscription ${createDto.subscriptionId} not found`,
        );
      }

      return new Types.ObjectId(createDto.subscriptionId);
    }

    if (!createDto.subscriptionEndpoint) {
      throw new BadRequestException(
        'subscriptionId or subscriptionEndpoint must be provided',
      );
    }

    const subscription = await this.pushSubscriptionModel
      .findOne({ endpoint: createDto.subscriptionEndpoint })
      .select('_id')
      .lean()
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription endpoint not found');
    }

    return new Types.ObjectId(subscription._id);
  }
}
