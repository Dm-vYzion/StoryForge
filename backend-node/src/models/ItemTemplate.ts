import mongoose, { Schema } from 'mongoose';
import { IItemTemplate, IItemStats, ItemCategory } from '../types/index.js';

const itemStatsSchema = new Schema<IItemStats>(
  {
    attackBonus: { type: Number },
    damage: { type: String },
    defense: { type: Number },
    charges: { type: Number },
    duration: { type: String },
    effect: { type: String },
  },
  { _id: false }
);

const itemTemplateSchema = new Schema<IItemTemplate>(
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
    category: {
      type: String,
      enum: ['weapon', 'armor', 'consumable', 'quest', 'misc'] as ItemCategory[],
      required: true,
      index: true,
    },
    rarity: {
      type: String,
      default: 'common',
    },
    description: {
      type: String,
      default: '',
    },
    stats: {
      type: itemStatsSchema,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isQuestItem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ItemTemplate = mongoose.model<IItemTemplate>('ItemTemplate', itemTemplateSchema);
