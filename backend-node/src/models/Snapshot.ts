import mongoose, { Schema } from 'mongoose';
import { 
  ISnapshot, 
  ISnapshotState, 
  IPcSnapshot, 
  IInventoryItem,
  IPartyInventoryItem,
  IWorldItem,
  INpcSnapshot,
  IMonsterSnapshot,
  ILocationSnapshot
} from '../types/index';

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    instanceItemId: { type: String, required: true },
    itemTemplateId: { type: Schema.Types.ObjectId, ref: 'ItemTemplate', required: true },
    equippedSlot: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    chargesRemaining: { type: Number },
  },
  { _id: false }
);

const pcSnapshotSchema = new Schema<IPcSnapshot>(
  {
    playerCharacterId: { type: Schema.Types.ObjectId, ref: 'PlayerCharacter', required: true },
    level: { type: Number, required: true },
    currentHp: { type: Number, required: true },
    inventory: { type: [inventoryItemSchema], default: [] },
    questFlags: { type: Schema.Types.Mixed, default: {} },
    localTitles: { type: [String], default: [] },
  },
  { _id: false }
);

const partyInventoryItemSchema = new Schema<IPartyInventoryItem>(
  {
    instanceItemId: { type: String, required: true },
    itemTemplateId: { type: Schema.Types.ObjectId, ref: 'ItemTemplate', required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const worldItemSchema = new Schema<IWorldItem>(
  {
    instanceItemId: { type: String, required: true },
    itemTemplateId: { type: Schema.Types.ObjectId, ref: 'ItemTemplate', required: true },
    locationId: { type: String },
    isLooted: { type: Boolean, default: false },
  },
  { _id: false }
);

const npcSnapshotSchema = new Schema<INpcSnapshot>(
  {
    campaignNpcId: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'NpcTemplate' },
    alive: { type: Boolean, default: true },
    currentLocation: { type: String },
    relationshipToPcs: { type: String },
    flags: { type: Schema.Types.Mixed, default: {} },
    localTitles: { type: [String], default: [] },
  },
  { _id: false }
);

const monsterSnapshotSchema = new Schema<IMonsterSnapshot>(
  {
    encounterId: { type: String, required: true },
    instanceId: { type: String, required: true },
    bestiaryEntryId: { type: Schema.Types.ObjectId, ref: 'BestiaryEntry', required: true },
    currentHp: { type: Number, required: true },
    status: { type: String, default: 'alive' },
  },
  { _id: false }
);

const locationSnapshotSchema = new Schema<ILocationSnapshot>(
  {
    campaignLocationId: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'EnvironmentTemplate' },
    isDestroyed: { type: Boolean, default: false },
    lastEvent: { type: String },
    flags: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const snapshotStateSchema = new Schema<ISnapshotState>(
  {
    pcs: { type: [pcSnapshotSchema], default: [] },
    partyInventory: { type: [partyInventoryItemSchema], default: [] },
    worldItems: { type: [worldItemSchema], default: [] },
    npcs: { type: [npcSnapshotSchema], default: [] },
    monsters: { type: [monsterSnapshotSchema], default: [] },
    locations: { type: [locationSnapshotSchema], default: [] },
    worldFlags: { type: Schema.Types.Mixed, default: {} },
    quests: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const snapshotSchema = new Schema<ISnapshot>(
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
    state: {
      type: snapshotStateSchema,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes
snapshotSchema.index({ instanceId: 1, branchId: 1, sequence: -1 });
snapshotSchema.index({ instanceId: 1, branchId: 1, createdAt: -1 });

export const Snapshot = mongoose.model<ISnapshot>('Snapshot', snapshotSchema);
