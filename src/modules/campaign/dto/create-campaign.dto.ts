import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Weekly digest' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Your weekly update is ready.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message!: string;
}
