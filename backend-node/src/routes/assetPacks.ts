import { Router, Request, Response } from 'express';
import { AssetPack, CampaignDefinition } from '../models/index';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { createAssetPackSchema } from '../schemas/index';
import { Types } from 'mongoose';

const router = Router();

/**
 * POST /asset-packs
 * Create a new asset pack from existing template IDs
 */
router.post(
  '/',
  requireAuth,
  validate(createAssetPackSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const pack = await AssetPack.create({
      ...req.body,
      authorUserId: req.user!._id,
      includedNpcTemplateIds: req.body.includedNpcTemplateIds?.map(
        (id: string) => new Types.ObjectId(id)
      ) || [],
      includedBestiaryEntryIds: req.body.includedBestiaryEntryIds?.map(
        (id: string) => new Types.ObjectId(id)
      ) || [],
      includedItemTemplateIds: req.body.includedItemTemplateIds?.map(
        (id: string) => new Types.ObjectId(id)
      ) || [],
      includedEnvironmentTemplateIds: req.body.includedEnvironmentTemplateIds?.map(
        (id: string) => new Types.ObjectId(id)
      ) || [],
    });

    res.status(201).json({
      success: true,
      data: pack,
    });
  })
);

/**
 * GET /asset-packs/public
 * List public asset packs (marketplace)
 */
router.get(
  '/public',
  asyncHandler(async (req: Request, res: Response) => {
    const { type, page = '1', limit = '20' } = req.query;

    const query: Record<string, unknown> = {};
    if (type) {
      query.type = type;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [packs, total] = await Promise.all([
      AssetPack.find(query)
        .select('name description type isPaid price currency authorUserId createdAt')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      AssetPack.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        packs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  })
);

/**
 * GET /asset-packs/:id
 * Get asset pack details with contents
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const pack = await AssetPack.findById(req.params.id)
      .populate('includedNpcTemplateIds', 'name race role tags')
      .populate('includedBestiaryEntryIds', 'name category challengeRating tags')
      .populate('includedItemTemplateIds', 'name category rarity tags')
      .populate('includedEnvironmentTemplateIds', 'name type tags');

    if (!pack) {
      throw new ApiError(404, 'Asset pack not found');
    }

    res.json({
      success: true,
      data: pack,
    });
  })
);

/**
 * POST /asset-packs/:id/import-into-campaign-def/:campaignDefId
 * Import pack contents into a campaign definition
 */
router.post(
  '/:id/import-into-campaign-def/:campaignDefId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const pack = await AssetPack.findById(req.params.id);
    if (!pack) {
      throw new ApiError(404, 'Asset pack not found');
    }

    const campaignDef = await CampaignDefinition.findById(req.params.campaignDefId);
    if (!campaignDef) {
      throw new ApiError(404, 'Campaign definition not found');
    }

    // Verify ownership
    if (campaignDef.authorUserId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only import packs into your own campaigns');
    }

    // Import NPCs - create campaign-local NPC entries with template references
    const importedNpcs = pack.includedNpcTemplateIds.map((templateId, index) => ({
      id: `imported_npc_${templateId}_${Date.now()}_${index}`,
      templateId,
      name: `Imported NPC ${index + 1}`, // Will be resolved from template
      role: 'imported',
    }));

    // Import encounters referencing bestiary entries
    const importedEncounters = pack.includedBestiaryEntryIds.map((bestiaryId, index) => ({
      id: `imported_encounter_${bestiaryId}_${Date.now()}_${index}`,
      name: `Imported Encounter ${index + 1}`,
      bestiaryEntryIds: [bestiaryId],
    }));

    // Import locations referencing environment templates
    const importedLocations = pack.includedEnvironmentTemplateIds.map((templateId, index) => ({
      id: `imported_location_${templateId}_${Date.now()}_${index}`,
      templateId,
      name: `Imported Location ${index + 1}`,
      type: 'other',
    }));

    // Update campaign definition
    await CampaignDefinition.findByIdAndUpdate(req.params.campaignDefId, {
      $push: {
        npcs: { $each: importedNpcs },
        encounters: { $each: importedEncounters },
        locations: { $each: importedLocations },
      },
    });

    res.json({
      success: true,
      data: {
        imported: {
          npcs: importedNpcs.length,
          encounters: importedEncounters.length,
          locations: importedLocations.length,
          items: pack.includedItemTemplateIds.length, // Items are referenced, not copied
        },
        message: 'Asset pack imported successfully',
      },
    });
  })
);

export default router;
