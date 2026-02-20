import { Types } from 'mongoose';

// ============== Common Types ==============

export type ObjectId = Types.ObjectId;

export type PlanType = 'free' | 'pro' | 'lifetime' | 'admin';

export type VisibilityType = 'private' | 'public' | 'marketplace';

export type LicenseModeType = 'open' | 'paid' | 'invite-only';

export type AssetType = 'campaign' | 'world' | 'assetPack';

export type AssetPackType = 'npc' | 'bestiary' | 'item' | 'location' | 'mixed';

export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc';

export type EnvironmentType = 'tavern' | 'shop' | 'dungeon' | 'landmark' | 'wilderness' | 'city' | 'village' | 'castle' | 'cave' | 'temple' | 'other';

// ============== User Types ==============

export interface IUser {
  _id: ObjectId;
  email: string;
  passwordHash?: string;
  googleId?: string;
  displayName: string;
  plan: PlanType;
  aiUsageThisPeriod: number;
  aiUsagePeriodStart: Date;
  aiApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ============== World Types ==============

export interface IWorld {
  _id: ObjectId;
  authorUserId: ObjectId;
  name: string;
  slug: string;
  description: string;
  baseTruths: Record<string, unknown>;
  defaultTags: string[];
  linkedNpcTemplateIds: ObjectId[];
  linkedBestiaryEntryIds: ObjectId[];
  linkedItemTemplateIds: ObjectId[];
  linkedEnvironmentTemplateIds: ObjectId[];
  linkedAssetPackIds: ObjectId[];
  licenseMode: LicenseModeType;
  licensePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============== Campaign Definition Types ==============

export interface ILevelRange {
  min: number;
  max: number;
}

export interface IQuestDefinition {
  id: string;
  name: string;
  description: string;
  recommendedLevelRange?: ILevelRange;
  prerequisites?: string[];
  objectives?: string[];
  rewards?: string[];
}

export interface ICampaignNpc {
  id: string;
  templateId?: ObjectId;
  name: string;
  role: string;
  faction?: string;
  personality?: Record<string, unknown>;
  location?: string;
  isEssential?: boolean;
}

export interface ICampaignEncounter {
  id: string;
  name: string;
  bestiaryEntryIds: ObjectId[];
  locationId?: string;
  difficulty?: string;
  triggers?: string[];
}

export interface ICampaignLocation {
  id: string;
  templateId?: ObjectId;
  name: string;
  type: string;
  description?: string;
  connectedLocationIds?: string[];
}

export interface ICampaignDefinition {
  _id: ObjectId;
  authorUserId: ObjectId;
  worldId?: ObjectId;
  title: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  baseTruths: Record<string, unknown>;
  recommendedLevel: ILevelRange;
  quests: IQuestDefinition[];
  visibility: VisibilityType;
  isPaid: boolean;
  price: number;
  currency: string;
  assetRefs: string[];
  npcs: ICampaignNpc[];
  encounters: ICampaignEncounter[];
  locations: ICampaignLocation[];
  createdAt: Date;
  updatedAt: Date;
}

// ============== Player Character Types ==============

export interface IBaseStats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface IAbility {
  id: string;
  name: string;
  description: string;
  type?: string;
  level?: number;
}

export interface IGlobalAchievement {
  id: string;
  label: string;
  campaignDefId?: ObjectId;
  earnedAt?: Date;
}

export interface IPlayerCharacter {
  _id: ObjectId;
  ownerUserId: ObjectId;
  name: string;
  race: string;
  class: string;
  level: number;
  maxHp: number;
  baseStats: IBaseStats;
  abilities: IAbility[];
  background: string;
  biography: string;
  titles: string[];
  globalAchievements: IGlobalAchievement[];
  portraitUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============== NPC Template Types ==============

export interface IPersonality {
  traits: string[];
  motivations: string[];
  fears: string[];
  quirks?: string[];
}

export interface INpcTemplate {
  _id: ObjectId;
  authorUserId: ObjectId;
  name: string;
  race: string;
  role: string;
  faction?: string;
  baselineLevel: number;
  personality: IPersonality;
  statBlock: Record<string, unknown>;
  tags: string[];
  backstory: string;
  defaultTitles: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============== Bestiary Entry Types ==============

export interface IBestiaryStatBlock {
  hp: number;
  ac: number;
  speed?: string;
  attacks?: Array<{
    name: string;
    bonus: number;
    damage: string;
    type: string;
  }>;
  abilities?: string[];
  resistances?: string[];
  vulnerabilities?: string[];
  immunities?: string[];
}

export interface IBestiaryEntry {
  _id: ObjectId;
  authorUserId: ObjectId;
  name: string;
  category: string;
  challengeRating: number | string;
  recommendedLevelRange: ILevelRange;
  statBlock: IBestiaryStatBlock;
  tags: string[];
  lore: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============== Item Template Types ==============

export interface IItemStats {
  attackBonus?: number;
  damage?: string;
  defense?: number;
  charges?: number;
  duration?: string;
  effect?: string;
}

export interface IItemTemplate {
  _id: ObjectId;
  authorUserId: ObjectId;
  name: string;
  category: ItemCategory;
  rarity: string;
  description: string;
  stats: IItemStats;
  tags: string[];
  isQuestItem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============== Environment Template Types ==============

export interface IEnvironmentDefaultState {
  isDestroyed?: boolean;
  ownerNpcTemplateId?: ObjectId;
  isLocked?: boolean;
  isHidden?: boolean;
  customFlags?: Record<string, unknown>;
}

export interface IEnvironmentTemplate {
  _id: ObjectId;
  authorUserId: ObjectId;
  name: string;
  type: EnvironmentType;
  defaultLocation?: string;
  tags: string[];
  description: string;
  defaultState: IEnvironmentDefaultState;
  createdAt: Date;
  updatedAt: Date;
}

// ============== Asset Pack Types ==============

export interface IAssetPack {
  _id: ObjectId;
  authorUserId: ObjectId;
  name: string;
  description: string;
  type: AssetPackType;
  includedNpcTemplateIds: ObjectId[];
  includedBestiaryEntryIds: ObjectId[];
  includedItemTemplateIds: ObjectId[];
  includedEnvironmentTemplateIds: ObjectId[];
  isPaid: boolean;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============== Campaign Instance Types ==============

export interface ICampaignInstance {
  _id: ObjectId;
  userId: ObjectId;
  campaignDefId: ObjectId;
  worldId?: ObjectId;
  branchId: string;
  title: string;
  selectedPcIds: ObjectId[];
  currentSnapshotId?: ObjectId;
  createdAt: Date;
  lastPlayedAt: Date;
}

// ============== Event Types ==============

export type EventType = 
  | 'NpcKilled'
  | 'NpcMet'
  | 'NpcRelationshipChanged'
  | 'QuestStarted'
  | 'QuestCompleted'
  | 'QuestFailed'
  | 'QuestStateChanged'
  | 'ItemGained'
  | 'ItemLost'
  | 'ItemUsed'
  | 'ItemEquipped'
  | 'ItemUnequipped'
  | 'LocationDiscovered'
  | 'LocationDestroyed'
  | 'LocationEntered'
  | 'SceneEntered'
  | 'DialogChoiceMade'
  | 'CombatStarted'
  | 'CombatEnded'
  | 'PcLeveledUp'
  | 'PcDamaged'
  | 'PcHealed'
  | 'PcDied'
  | 'WorldFlagChanged'
  | 'BranchCreated'
  | 'Custom';

export interface IEvent {
  _id: ObjectId;
  instanceId: ObjectId;
  branchId: string;
  sequence: number;
  type: EventType;
  payload: Record<string, unknown>;
  createdAt: Date;
}

// ============== Snapshot Types ==============

export interface IInventoryItem {
  instanceItemId: string;
  itemTemplateId: ObjectId;
  equippedSlot?: string;
  quantity: number;
  chargesRemaining?: number | null;
}

export interface IPcSnapshot {
  playerCharacterId: ObjectId;
  level: number;
  currentHp: number;
  inventory: IInventoryItem[];
  questFlags: Record<string, string>;
  localTitles?: string[];
}

export interface IPartyInventoryItem {
  instanceItemId: string;
  itemTemplateId: ObjectId;
  quantity: number;
}

export interface IWorldItem {
  instanceItemId: string;
  itemTemplateId: ObjectId;
  locationId?: string;
  isLooted: boolean;
}

export interface INpcSnapshot {
  campaignNpcId: string;
  templateId?: ObjectId;
  alive: boolean;
  currentLocation?: string;
  relationshipToPcs?: string;
  flags?: Record<string, unknown>;
  localTitles?: string[];
}

export interface IMonsterSnapshot {
  encounterId: string;
  instanceId: string;
  bestiaryEntryId: ObjectId;
  currentHp: number;
  status: string;
}

export interface ILocationSnapshot {
  campaignLocationId: string;
  templateId?: ObjectId;
  isDestroyed: boolean;
  lastEvent?: string;
  flags?: Record<string, unknown>;
}

export interface ISnapshotState {
  pcs: IPcSnapshot[];
  partyInventory?: IPartyInventoryItem[];
  worldItems?: IWorldItem[];
  npcs: INpcSnapshot[];
  monsters: IMonsterSnapshot[];
  locations: ILocationSnapshot[];
  worldFlags: Record<string, unknown>;
  quests: Array<unknown>;
}

export interface ISnapshot {
  _id: ObjectId;
  instanceId: ObjectId;
  branchId: string;
  sequence: number;
  createdAt: Date;
  state: ISnapshotState;
}

// ============== Purchase Types ==============

export interface IPurchase {
  _id: ObjectId;
  buyerUserId: ObjectId;
  assetType: AssetType;
  assetId: ObjectId;
  pricePaid: number;
  currency: string;
  provider: string;
  providerChargeId: string;
  createdAt: Date;
}

// ============== Request Types ==============

export interface AuthenticatedRequest {
  user?: IUser;
}

// ============== Response Types ==============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
