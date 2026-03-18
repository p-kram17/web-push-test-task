import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
import { NotificationService } from '../notification/notification.service';
import { PUSH_QUEUE } from './queue.constants';

@Injectable()
export class QueueProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueProcessor.name);
  private worker?: Worker;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    @Inject(PUSH_QUEUE)
    private readonly pushQueue: Queue,
  ) {}

  onModuleInit() {
    const queueName = this.configService.getOrThrow<string>('queue.name');
    const sendCampaignJobName = this.configService.getOrThrow<string>(
      'queue.sendCampaignJobName',
    );

    this.worker = new Worker(
      queueName,
      async (job: Job<{ campaignId: string }>) => {
        if (job.name !== sendCampaignJobName) {
          this.logger.warn(`Unknown job received: ${job.name}`);
          return;
        }

        await this.notificationService.sendCampaign(job.data.campaignId);
      },
      {
        connection: this.createConnectionOptions(),
        concurrency: this.configService.get<number>('app.queueConcurrency', 10),
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id?.toString() ?? 'unknown'} completed`);
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Job ${job?.id?.toString() ?? 'unknown'} failed: ${error.message}`,
      );
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.pushQueue.close();
  }

  private createConnectionOptions() {
    return {
      host: this.configService.getOrThrow<string>('redis.host'),
      port: this.configService.getOrThrow<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      maxRetriesPerRequest: null,
    };
  }
}
