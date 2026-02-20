import mongoose, { Schema } from 'mongoose';
import { IEvent, EventType } from '../types/index.js';

const eventTypes: EventType[] = [
  'NpcKilled',
  'NpcMet',
  'NpcRelationshipChanged',
  'QuestStarted',
  'QuestCompleted',
  'QuestFailed',
  'QuestStateChanged',
  'ItemGained',
  'ItemLost',
  'ItemUsed',
  'ItemEquipped',
  'ItemUnequipped',
  'LocationDiscovered',
  'LocationDestroyed',
  'LocationEntered',
  'SceneEntered',
  'DialogChoiceMade',
  'CombatStarted',
  'CombatEnded',
  'PcLeveledUp',
  'PcDamaged',
  'PcHealed',
  'PcDied',
  'WorldFlagChanged',
  'BranchCreated',
  'Custom',
];

const eventSchema = new Schema<IEvent>(
  {
    instanceId: {
      type: Schema.Types.ObjectId,
      ref: 'CampaignInstance',
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      required: true,
      index: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: eventTypes,
      required: true,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for efficient querying
eventSchema.index({ instanceId: 1, branchId: 1, sequence: 1 });
eventSchema.index({ instanceId: 1, branchId: 1, createdAt: -1 });
eventSchema.index({ type: 1, createdAt: -1 }); // For analytics

// Ensure unique sequence per instance + branch
eventSchema.index({ instanceId: 1, branchId: 1, sequence: 1 }, { unique: true });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
