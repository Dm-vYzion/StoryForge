import mongoose, { Schema } from 'mongoose';
import { 
  ICampaignDefinition, 
  IQuestDefinition, 
  ICampaignNpc, 
  ICampaignEncounter, 
  ICampaignLocation,
  ILevelRange,
  VisibilityType 
} from '../types/index.js';

const levelRangeSchema = new Schema<ILevelRange>(
  {
    min: { type: Number, required: true, default: 1 },
    max: { type: Number, required: true, default: 20 },
  },
  { _id: false }
);

const questDefinitionSchema = new Schema<IQuestDefinition>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    recommendedLevelRange: levelRangeSchema,
    prerequisites: { type: [String], default: [] },
    objectives: { type: [String], default: [] },
    rewards: { type: [String], default: [] },
  },
  { _id: false }
);

const campaignNpcSchema = new Schema<ICampaignNpc>(
  {
    id: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'NpcTemplate' },
    name: { type: String, required: true },
    role: { type: String, required: true },
    faction: { type: String },
    personality: { type: Schema.Types.Mixed },
    location: { type: String },
    isEssential: { type: Boolean, default: false },
  },
  { _id: false }
);

const campaignEncounterSchema = new Schema<ICampaignEncounter>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    bestiaryEntryIds: {
      type: [Schema.Types.ObjectId],
      ref: 'BestiaryEntry',
      default: [],
    },
    locationId: { type: String },
    difficulty: { type: String },
    triggers: { type: [String], default: [] },
  },
  { _id: false }
);

const campaignLocationSchema = new Schema<ICampaignLocation>(
  {
    id: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'EnvironmentTemplate' },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    connectedLocationIds: { type: [String], default: [] },
  },
  { _id: false }
);

const campaignDefinitionSchema = new Schema<ICampaignDefinition>(
  {
    authorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    worldId: {
      type: Schema.Types.ObjectId,
      ref: 'World',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    longDescription: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    baseTruths: {
      type: Schema.Types.Mixed,
      default: {},
    },
    recommendedLevel: {
      type: levelRangeSchema,
      default: { min: 1, max: 5 },
    },
    quests: {
      type: [questDefinitionSchema],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['private', 'public', 'marketplace'] as VisibilityType[],
      default: 'private',
      index: true,
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
    assetRefs: {
      type: [String],
      default: [],
    },
    npcs: {
      type: [campaignNpcSchema],
      default: [],
    },
    encounters: {
      type: [campaignEncounterSchema],
      default: [],
    },
    locations: {
      type: [campaignLocationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
campaignDefinitionSchema.index({ visibility: 1, tags: 1 });
campaignDefinitionSchema.index({ visibility: 1, 'recommendedLevel.min': 1, 'recommendedLevel.max': 1 });

export const CampaignDefinition = mongoose.model<ICampaignDefinition>(
  'CampaignDefinition',
  campaignDefinitionSchema
);
