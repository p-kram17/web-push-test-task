import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PushSubscriptionDocument = HydratedDocument<PushSubscription>;

@Schema({ _id: false })
export class PushSubscriptionKeys {
  @Prop({ required: true })
  p256dh!: string;

  @Prop({ required: true })
  auth!: string;
}

const PushSubscriptionKeysSchema =
  SchemaFactory.createForClass(PushSubscriptionKeys);

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'push_subscriptions',
})
export class PushSubscription {
  @Prop({ required: true, unique: true, index: true })
  endpoint!: string;

  @Prop({ type: PushSubscriptionKeysSchema, required: true })
  keys!: PushSubscriptionKeys;

  createdAt!: Date;
}

export const PushSubscriptionSchema =
  SchemaFactory.createForClass(PushSubscription);
