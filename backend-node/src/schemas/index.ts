import { z } from 'zod';

// ============== Auth Schemas ==============

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

// ============== World Schemas ==============

export const createWorldSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  baseTruths: z.record(z.unknown()).optional(),
  defaultTags: z.array(z.string()).optional(),
  licenseMode: z.enum(['open', 'paid', 'invite-only']).optional(),
  licensePrice: z.number().min(0).optional(),
});

export const worldQuerySchema = z.object({
  tags: z.string().optional(),
  licenseMode: z.enum(['open', 'paid', 'invite-only']).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// ============== Asset Pack Schemas ==============

export const createAssetPackSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  type: z.enum(['npc', 'bestiary', 'item', 'location', 'mixed']),
  includedNpcTemplateIds: z.array(z.string()).optional(),
  includedBestiaryEntryIds: z.array(z.string()).optional(),
  includedItemTemplateIds: z.array(z.string()).optional(),
  includedEnvironmentTemplateIds: z.array(z.string()).optional(),
  isPaid: z.boolean().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
});

// ============== Template Schemas ==============

export const createNpcTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  race: z.string().min(1),
  role: z.string().min(1),
  faction: z.string().optional(),
  baselineLevel: z.number().min(1).max(30).optional(),
  personality: z.object({
    traits: z.array(z.string()).optional(),
    motivations: z.array(z.string()).optional(),
    fears: z.array(z.string()).optional(),
    quirks: z.array(z.string()).optional(),
  }).optional(),
  statBlock: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  backstory: z.string().optional(),
  defaultTitles: z.array(z.string()).optional(),
});

export const createBestiaryEntrySchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1),
  challengeRating: z.union([z.number(), z.string()]),
  recommendedLevelRange: z.object({
    min: z.number().min(1).max(30),
    max: z.number().min(1).max(30),
  }).optional(),
  statBlock: z.object({
    hp: z.number().min(1),
    ac: z.number().min(1),
    speed: z.string().optional(),
    attacks: z.array(z.object({
      name: z.string(),
      bonus: z.number(),
      damage: z.string(),
      type: z.string(),
    })).optional(),
    abilities: z.array(z.string()).optional(),
    resistances: z.array(z.string()).optional(),
    vulnerabilities: z.array(z.string()).optional(),
    immunities: z.array(z.string()).optional(),
  }),
  tags: z.array(z.string()).optional(),
  lore: z.string().optional(),
});

export const createItemTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['weapon', 'armor', 'consumable', 'quest', 'misc']),
  rarity: z.string().optional(),
  description: z.string().optional(),
  stats: z.object({
    attackBonus: z.number().optional(),
    damage: z.string().optional(),
    defense: z.number().optional(),
    charges: z.number().optional(),
    duration: z.string().optional(),
    effect: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  isQuestItem: z.boolean().optional(),
});

export const createEnvironmentTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['tavern', 'shop', 'dungeon', 'landmark', 'wilderness', 'city', 'village', 'castle', 'cave', 'temple', 'other']),
  defaultLocation: z.string().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  defaultState: z.object({
    isDestroyed: z.boolean().optional(),
    ownerNpcTemplateId: z.string().optional(),
    isLocked: z.boolean().optional(),
    isHidden: z.boolean().optional(),
    customFlags: z.record(z.unknown()).optional(),
  }).optional(),
});

// ============== Campaign Definition Schemas ==============

export const createCampaignDefSchema = z.object({
  worldId: z.string().optional(),
  title: z.string().min(2).max(200),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  baseTruths: z.record(z.unknown()).optional(),
  recommendedLevel: z.object({
    min: z.number().min(1).max(20),
    max: z.number().min(1).max(20),
  }).optional(),
  visibility: z.enum(['private', 'public', 'marketplace']).optional(),
  isPaid: z.boolean().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
});

export const updateCampaignDefSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  baseTruths: z.record(z.unknown()).optional(),
  recommendedLevel: z.object({
    min: z.number().min(1).max(20),
    max: z.number().min(1).max(20),
  }).optional(),
  visibility: z.enum(['private', 'public', 'marketplace']).optional(),
  isPaid: z.boolean().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  quests: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    recommendedLevelRange: z.object({ min: z.number(), max: z.number() }).optional(),
    prerequisites: z.array(z.string()).optional(),
    objectives: z.array(z.string()).optional(),
    rewards: z.array(z.string()).optional(),
  })).optional(),
  npcs: z.array(z.object({
    id: z.string(),
    templateId: z.string().optional(),
    name: z.string(),
    role: z.string(),
    faction: z.string().optional(),
    personality: z.record(z.unknown()).optional(),
    location: z.string().optional(),
    isEssential: z.boolean().optional(),
  })).optional(),
  encounters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    bestiaryEntryIds: z.array(z.string()).optional(),
    locationId: z.string().optional(),
    difficulty: z.string().optional(),
    triggers: z.array(z.string()).optional(),
  })).optional(),
  locations: z.array(z.object({
    id: z.string(),
    templateId: z.string().optional(),
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    connectedLocationIds: z.array(z.string()).optional(),
  })).optional(),
});

export const campaignDefQuerySchema = z.object({
  tags: z.string().optional(),
  worldId: z.string().optional(),
  minLevel: z.string().transform(Number).optional(),
  maxLevel: z.string().transform(Number).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// ============== Player Character Schemas ==============

export const createPlayerCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  race: z.string().min(1),
  class: z.string().min(1),
  level: z.number().min(1).max(20).optional(),
  maxHp: z.number().min(1),
  baseStats: z.object({
    STR: z.number().min(1).max(30),
    DEX: z.number().min(1).max(30),
    CON: z.number().min(1).max(30),
    INT: z.number().min(1).max(30),
    WIS: z.number().min(1).max(30),
    CHA: z.number().min(1).max(30),
  }),
  abilities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    type: z.string().optional(),
    level: z.number().optional(),
  })).optional(),
  background: z.string().optional(),
  biography: z.string().optional(),
  titles: z.array(z.string()).optional(),
  portraitUrl: z.string().url().optional(),
});

export const updatePlayerCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  biography: z.string().optional(),
  titles: z.array(z.string()).optional(),
  portraitUrl: z.string().url().optional(),
});

// ============== Campaign Instance Schemas ==============

export const createCampaignInstanceSchema = z.object({
  campaignDefId: z.string().min(1),
  title: z.string().min(1).max(200),
  selectedPcIds: z.array(z.string()).min(1, 'At least one character is required'),
});

export const forkCampaignInstanceSchema = z.object({
  fromSnapshotId: z.string().optional(),
  newBranchName: z.string().min(1).max(100).optional(),
});

// ============== Event Schemas ==============

export const createEventSchema = z.object({
  branchId: z.string().min(1),
  type: z.string().min(1),
  payload: z.record(z.unknown()),
});

export const eventQuerySchema = z.object({
  branchId: z.string().optional(),
  fromSequence: z.string().transform(Number).optional(),
  toSequence: z.string().transform(Number).optional(),
  type: z.string().optional(),
});

// ============== Snapshot Schemas ==============

export const createSnapshotSchema = z.object({
  branchId: z.string().min(1),
  state: z.object({
    pcs: z.array(z.unknown()),
    partyInventory: z.array(z.unknown()).optional(),
    worldItems: z.array(z.unknown()).optional(),
    npcs: z.array(z.unknown()),
    monsters: z.array(z.unknown()),
    locations: z.array(z.unknown()),
    worldFlags: z.record(z.unknown()),
    quests: z.array(z.unknown()),
  }),
});

// ============== Inventory Schemas ==============

export const transferItemSchema = z.object({
  branchId: z.string().min(1),
  instanceItemId: z.string().min(1),
  from: z.object({
    type: z.enum(['pc', 'party', 'world']),
    id: z.string().optional(),
  }),
  to: z.object({
    type: z.enum(['pc', 'party', 'world']),
    id: z.string().optional(),
    locationId: z.string().optional(),
  }),
  quantity: z.number().min(1).optional(),
});

export const useItemSchema = z.object({
  branchId: z.string().min(1),
  instanceItemId: z.string().min(1),
  pcId: z.string().min(1),
  targetId: z.string().optional(),
  quantity: z.number().min(1).optional(),
});

// ============== Purchase Schemas ==============

export const checkoutSchema = z.object({
  assetType: z.enum(['campaign', 'world', 'assetPack']),
  assetId: z.string().min(1),
});

// ============== AI Schemas ==============

export const aiGenerateSchema = z.object({
  prompt: z.string().min(1).max(10000),
  context: z.record(z.unknown()).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateWorldInput = z.infer<typeof createWorldSchema>;
export type CreateAssetPackInput = z.infer<typeof createAssetPackSchema>;
export type CreateNpcTemplateInput = z.infer<typeof createNpcTemplateSchema>;
export type CreateBestiaryEntryInput = z.infer<typeof createBestiaryEntrySchema>;
export type CreateItemTemplateInput = z.infer<typeof createItemTemplateSchema>;
export type CreateEnvironmentTemplateInput = z.infer<typeof createEnvironmentTemplateSchema>;
export type CreateCampaignDefInput = z.infer<typeof createCampaignDefSchema>;
export type UpdateCampaignDefInput = z.infer<typeof updateCampaignDefSchema>;
export type CreatePlayerCharacterInput = z.infer<typeof createPlayerCharacterSchema>;
export type CreateCampaignInstanceInput = z.infer<typeof createCampaignInstanceSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;
export type TransferItemInput = z.infer<typeof transferItemSchema>;
export type UseItemInput = z.infer<typeof useItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AiGenerateInput = z.infer<typeof aiGenerateSchema>;
