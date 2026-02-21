import mongoose, { Schema } from 'mongoose';
import { INpcTemplate, IPersonality } from '../types/index';

const personalitySchema = new Schema<IPersonality>(
  {
    traits: { type: [String], default: [] },
    motivations: { type: [String], default: [] },
    fears: { type: [String], default: [] },
    quirks: { type: [String], default: [] },
  },
  { _id: false }
);

const npcTemplateSchema = new Schema<INpcTemplate>(
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
    race: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    faction: {
      type: String,
    },
    baselineLevel: {
      type: Number,
      default: 1,
    },
    personality: {
      type: personalitySchema,
      default: {},
    },
    statBlock: {
      type: Schema.Types.Mixed,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    backstory: {
      type: String,
      default: '',
    },
    defaultTitles: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const NpcTemplate = mongoose.model<INpcTemplate>('NpcTemplate', npcTemplateSchema);
