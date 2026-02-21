import mongoose, { Schema } from 'mongoose';
import { IAssetPack, AssetPackType } from '../types/index';

const assetPackSchema = new Schema<IAssetPack>(
  {
    authorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['npc', 'bestiary', 'item', 'location', 'mixed'] as AssetPackType[],
      required: true,
      index: true,
    },
    includedNpcTemplateIds: {
      type: [Schema.Types.ObjectId],
      ref: 'NpcTemplate',
      default: [],
    },
    includedBestiaryEntryIds: {
      type: [Schema.Types.ObjectId],
      ref: 'BestiaryEntry',
      default: [],
    },
    includedItemTemplateIds: {
      type: [Schema.Types.ObjectId],
      ref: 'ItemTemplate',
      default: [],
    },
    includedEnvironmentTemplateIds: {
      type: [Schema.Types.ObjectId],
      ref: 'EnvironmentTemplate',
      default: [],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  {
    timestamps: true,
  }
);

// Index for marketplace queries
assetPackSchema.index({ type: 1, isPaid: 1 });

export const AssetPack = mongoose.model<IAssetPack>('AssetPack', assetPackSchema);
