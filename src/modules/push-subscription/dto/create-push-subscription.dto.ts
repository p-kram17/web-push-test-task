import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class SubscriptionKeysDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class CreatePushSubscriptionDto {
  @ApiProperty({
    example: 'https://fcm.googleapis.com/fcm/send/dummy-endpoint',
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  endpoint!: string;

  @ApiProperty({ type: SubscriptionKeysDto })
  @ValidateNested()
  @Type(() => SubscriptionKeysDto)
  keys!: SubscriptionKeysDto;

  @ApiProperty({
    required: false,
    nullable: true,
    example: null,
  })
  @IsOptional()
  expirationTime?: number | null;
}
