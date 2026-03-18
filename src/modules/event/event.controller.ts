import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { EventService } from './event.service';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Track client-side push notification events' })
  @ApiCreatedResponse({
    description: 'Push event stored successfully.',
  })
  create(@Body() createDto: CreateEventDto) {
    return this.eventService.create(createDto);
  }
}
