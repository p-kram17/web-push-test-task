import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { PUSH_QUEUE } from './queue.constants';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Inject(PUSH_QUEUE)
    private readonly pushQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async enqueueCampaign(campaignId: string) {
    await this.pushQueue.add(
      this.configService.getOrThrow<string>('queue.sendCampaignJobName'),
      { campaignId },
      {
        jobId: `campaign-${campaignId}`,
      },
    );

    this.logger.log(
      `Campaign ${campaignId} added to ${this.configService.getOrThrow<string>('queue.name')}`,
    );
  }
}
