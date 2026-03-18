import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from './schemas/push-subscription.schema';

@Injectable()
export class PushSubscriptionService {
  private readonly logger = new Logger(PushSubscriptionService.name);

  constructor(
    @InjectModel(PushSubscription.name)
    private readonly pushSubscriptionModel: Model<PushSubscriptionDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createOrUpdate(createDto: CreatePushSubscriptionDto) {
    const subscription = await this.pushSubscriptionModel
      .findOneAndUpdate(
        { endpoint: createDto.endpoint },
        {
          $set: {
            keys: createDto.keys,
          },
          $setOnInsert: {
            endpoint: createDto.endpoint,
            createdAt: new Date(),
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean()
      .exec();

    this.logger.log(`Subscription stored for endpoint: ${createDto.endpoint}`);

    return subscription;
  }

  getPublicKey() {
    return {
      publicKey: this.configService.getOrThrow<string>('vapid.publicKey'),
    };
  }
}
