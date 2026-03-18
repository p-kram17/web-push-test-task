import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a campaign and enqueue async push delivery',
  })
  @ApiCreatedResponse({
    description: 'Campaign created and queued successfully.',
  })
  create(@Body() createDto: CreateCampaignDto) {
    return this.campaignService.create(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign processing state by id' })
  @ApiOkResponse({
    description: 'Campaign fetched successfully.',
  })
  findOne(@Param('id') id: string) {
    return this.campaignService.findById(id);
  }
}
