import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { NotificationModule } from '../notification/notification.module';
import { QueueProcessor } from './queue.processor';
import { PUSH_QUEUE } from './queue.constants';
import { QueueService } from './queue.service';

@Module({
  imports: [NotificationModule],
  providers: [
    {
      provide: PUSH_QUEUE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connection = {
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          maxRetriesPerRequest: null,
        };

        return new Queue(configService.getOrThrow<string>('queue.name'), {
          connection,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
            removeOnComplete: 100,
            removeOnFail: 100,
          },
        });
      },
    },
    QueueService,
    QueueProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
