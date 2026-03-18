import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CampaignStatus } from '../../common/enums/campaign-status.enum';

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({
  timestamps: true,
  collection: 'campaigns',
})
export class Campaign {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({
    type: String,
    enum: CampaignStatus,
    default: CampaignStatus.PENDING,
    index: true,
  })
  status!: CampaignStatus;

  @Prop({ default: 0 })
  totalSubscriptions!: number;

  @Prop({ default: 0 })
  sentCount!: number;

  @Prop({ default: 0 })
  failedCount!: number;

  @Prop()
  processedAt?: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
