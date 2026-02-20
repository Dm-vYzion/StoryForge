import mongoose, { Schema } from 'mongoose';
import { IWorld, LicenseModeType } from '../types/index.js';

const worldSchema = new Schema<IWorld>(
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
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    baseTruths: {
      type: Schema.Types.Mixed,
      default: {},
    },
    defaultTags: {
      type: [String],
      default: [],
    },
    linkedNpcTemplateIds: {
      type: [Schema.Types.ObjectId],
      ref: 'NpcTemplate',
      default: [],
    },
    linkedBestiaryEntryIds: {
      type: [Schema.Types.ObjectId],
      ref: 'BestiaryEntry',
      default: [],
    },
    linkedItemTemplateIds: {
      type: [Schema.Types.ObjectId],
      ref: 'ItemTemplate',
      default: [],
    },
    linkedEnvironmentTemplateIds: {
      type: [Schema.Types.ObjectId],
      ref: 'EnvironmentTemplate',
      default: [],
    },
    linkedAssetPackIds: {
      type: [Schema.Types.ObjectId],
      ref: 'AssetPack',
      default: [],
    },
    licenseMode: {
      type: String,
      enum: ['open', 'paid', 'invite-only'] as LicenseModeType[],
      default: 'open',
    },
    licensePrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
worldSchema.index({ slug: 1 }, { unique: true });
worldSchema.index({ defaultTags: 1 });
worldSchema.index({ licenseMode: 1 });

export const World = mongoose.model<IWorld>('World', worldSchema);
