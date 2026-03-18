import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationStatus } from '../../common/enums/notification-status.enum';

export type NotificationLogDocument = HydratedDocument<NotificationLog>;

@Schema({
  timestamps: true,
  collection: 'notification_logs',
})
export class NotificationLog {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true, index: true })
  campaignId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'PushSubscription',
    required: true,
    index: true,
  })
  subscriptionId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: NotificationStatus,
    required: true,
    index: true,
  })
  status!: NotificationStatus;

  @Prop()
  errorMessage?: string;

  @Prop()
  deliveredAt?: Date;
}

export const NotificationLogSchema =
  SchemaFactory.createForClass(NotificationLog);

NotificationLogSchema.index(
  { campaignId: 1, subscriptionId: 1 },
  { unique: true },
);
