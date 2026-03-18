import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { PushSubscriptionService } from './push-subscription.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class PushSubscriptionController {
  constructor(
    private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a web push subscription' })
  @ApiCreatedResponse({
    description: 'Subscription persisted successfully.',
  })
  create(@Body() createDto: CreatePushSubscriptionDto) {
    return this.pushSubscriptionService.createOrUpdate(createDto);
  }

  @Get('public-key')
  @ApiOperation({
    summary: 'Get the public VAPID key for browser subscription flow',
  })
  @ApiOkResponse({
    schema: {
      example: {
        publicKey: 'BMN5...',
      },
    },
  })
  getPublicKey() {
    return this.pushSubscriptionService.getPublicKey();
  }
}
