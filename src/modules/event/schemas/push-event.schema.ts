import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PushEventType } from '../../common/enums/push-event-type.enum';

export type PushEventDocument = HydratedDocument<PushEvent>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'push_events',
})
export class PushEvent {
  @Prop({ type: String, enum: PushEventType, required: true, index: true })
  type!: PushEventType;

  @Prop({
    type: Types.ObjectId,
    ref: 'PushSubscription',
    required: true,
    index: true,
  })
  subscriptionId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true, index: true })
  campaignId!: Types.ObjectId;

  createdAt!: Date;
}

export const PushEventSchema = SchemaFactory.createForClass(PushEvent);
