import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PushEventType } from '../../common/enums/push-event-type.enum';

export class CreateEventDto {
  @ApiProperty({ enum: PushEventType, example: PushEventType.CLICK })
  @IsEnum(PushEventType)
  type!: PushEventType;

  @ApiProperty({ example: '65f6b6f0a44308fef7dd1f77' })
  @IsMongoId()
  campaignId!: string;

  @ApiPropertyOptional({ example: '65f6b6f0a44308fef7dd1f88' })
  @ValidateIf((dto: CreateEventDto) => !dto.subscriptionEndpoint)
  @IsMongoId()
  @IsOptional()
  subscriptionId?: string;

  @ApiPropertyOptional({
    example: 'https://fcm.googleapis.com/fcm/send/dummy-endpoint',
  })
  @ValidateIf((dto: CreateEventDto) => !dto.subscriptionId)
  @IsString()
  @IsOptional()
  subscriptionEndpoint?: string;
}
