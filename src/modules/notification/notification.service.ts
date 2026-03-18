import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as webPush from 'web-push';
import {
  Campaign,
  CampaignDocument,
} from '../campaign/schemas/campaign.schema';
import { CampaignStatus } from '../common/enums/campaign-status.enum';
import { NotificationStatus } from '../common/enums/notification-status.enum';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from '../push-subscription/schemas/push-subscription.schema';
import { PushPayload } from './interfaces/push-payload.interface';
import {
  NotificationLog,
  NotificationLogDocument,
} from './schemas/notification-log.schema';

interface WebPushError {
  message?: string;
  statusCode?: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly batchSize = 100;

  constructor(
    @InjectModel(PushSubscription.name)
    private readonly pushSubscriptionModel: Model<PushSubscriptionDocument>,
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(NotificationLog.name)
    private readonly notificationLogModel: Model<NotificationLogDocument>,
    private readonly configService: ConfigService,
  ) {
    webPush.setVapidDetails(
      this.configService.getOrThrow<string>('vapid.subject'),
      this.configService.getOrThrow<string>('vapid.publicKey'),
      this.configService.getOrThrow<string>('vapid.privateKey'),
    );
  }

  async sendCampaign(campaignId: string) {
    const campaign = await this.campaignModel.findById(campaignId).exec();

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    const subscriptions = await this.pushSubscriptionModel.find().lean().exec();

    if (subscriptions.length === 0) {
      await this.campaignModel.findByIdAndUpdate(campaignId, {
        status: CampaignStatus.COMPLETED,
        totalSubscriptions: 0,
        sentCount: 0,
        failedCount: 0,
        processedAt: new Date(),
      });
      return;
    }

    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: CampaignStatus.PROCESSING,
      totalSubscriptions: subscriptions.length,
    });

    const payload = this.buildPayload(campaign);
    let sentCount = 0;
    let failedCount = 0;

    for (let index = 0; index < subscriptions.length; index += this.batchSize) {
      const batch = subscriptions.slice(index, index + this.batchSize);
      const results = await Promise.allSettled(
        batch.map((subscription) =>
          this.sendToSubscription(
            campaign._id.toString(),
            subscription,
            payload,
          ),
        ),
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          sentCount += 1;
          continue;
        }

        failedCount += 1;
      }
    }

    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: CampaignStatus.COMPLETED,
      sentCount,
      failedCount,
      processedAt: new Date(),
    });

    this.logger.log(
      `Campaign ${campaignId} processed. Sent: ${sentCount}, failed: ${failedCount}`,
    );
  }

  private buildPayload(campaign: CampaignDocument): string {
    const payload: PushPayload = {
      title: campaign.title,
      body: campaign.message,
      campaignId: campaign._id.toString(),
      sentAt: new Date().toISOString(),
      apiBaseUrl: this.configService.getOrThrow<string>('app.apiBaseUrl'),
    };

    return JSON.stringify(payload);
  }

  private async sendToSubscription(
    campaignId: string,
    subscription:
      | PushSubscriptionDocument
      | (PushSubscription & { _id: Types.ObjectId }),
    payload: string,
  ): Promise<boolean> {
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        payload,
      );

      await this.notificationLogModel.findOneAndUpdate(
        {
          campaignId: new Types.ObjectId(campaignId),
          subscriptionId: new Types.ObjectId(subscription._id),
        },
        {
          status: NotificationStatus.SENT,
          deliveredAt: new Date(),
          errorMessage: null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return true;
    } catch (error) {
      const pushError = error as WebPushError;
      const message =
        error instanceof Error
          ? error.message
          : (pushError.message ?? 'Unknown push error');
      const statusCode = pushError.statusCode;

      await this.notificationLogModel.findOneAndUpdate(
        {
          campaignId: new Types.ObjectId(campaignId),
          subscriptionId: new Types.ObjectId(subscription._id),
        },
        {
          status: NotificationStatus.FAILED,
          errorMessage: message,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      if (statusCode === 404 || statusCode === 410) {
        await this.pushSubscriptionModel
          .deleteOne({ _id: subscription._id })
          .exec();
        this.logger.warn(
          `Removed invalid subscription ${subscription._id.toString()}`,
        );
      }

      this.logger.error(
        `Push failed for subscription ${subscription._id.toString()}: ${message}`,
      );

      return false;
    }
  }
}
