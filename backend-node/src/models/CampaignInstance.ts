import mongoose, { Schema } from 'mongoose';
import { ICampaignInstance } from '../types/index';

const campaignInstanceSchema = new Schema<ICampaignInstance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    campaignDefId: {
      type: Schema.Types.ObjectId,
      ref: 'CampaignDefinition',
      required: true,
      index: true,
    },
    worldId: {
      type: Schema.Types.ObjectId,
      ref: 'World',
    },
    branchId: {
      type: String,
      required: true,
      default: 'root',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    selectedPcIds: {
      type: [Schema.Types.ObjectId],
      ref: 'PlayerCharacter',
      default: [],
    },
    currentSnapshotId: {
      type: Schema.Types.ObjectId,
      ref: 'Snapshot',
    },
    lastPlayedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
campaignInstanceSchema.index({ userId: 1, lastPlayedAt: -1 });
campaignInstanceSchema.index({ userId: 1, campaignDefId: 1 });

export const CampaignInstance = mongoose.model<ICampaignInstance>(
  'CampaignInstance',
  campaignInstanceSchema
);
