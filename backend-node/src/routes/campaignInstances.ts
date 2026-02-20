import { Router, Request, Response } from 'express';
import { CampaignInstance, CampaignDefinition, PlayerCharacter, Event, Snapshot, Purchase } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import {
  createCampaignInstanceSchema,
  forkCampaignInstanceSchema,
  createEventSchema,
  eventQuerySchema,
  createSnapshotSchema,
  transferItemSchema,
  useItemSchema,
} from '../schemas/index.js';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /campaign-instances
 * Create a new campaign instance from a campaign definition
 */
router.post(
  '/',
  requireAuth,
  validate(createCampaignInstanceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { campaignDefId, title, selectedPcIds } = req.body;

    // Validate campaign definition
    const campaignDef = await CampaignDefinition.findById(campaignDefId);
    if (!campaignDef) {
      throw new ApiError(404, 'Campaign definition not found');
    }

    // Check if paid campaign requires purchase
    if (campaignDef.isPaid) {
      const isAuthor = campaignDef.authorUserId.toString() === req.user!._id.toString();
      
      if (!isAuthor) {
        const purchase = await Purchase.findOne({
          buyerUserId: req.user!._id,
          assetType: 'campaign',
          assetId: campaignDef._id,
        });

        if (!purchase) {
          throw new ApiError(403, 'You need to purchase this campaign to play it');
        }
      }
    }

    // Validate player characters
    const pcIds = selectedPcIds.map((id: string) => new Types.ObjectId(id));
    const characters = await PlayerCharacter.find({
      _id: { $in: pcIds },
      ownerUserId: req.user!._id,
    });

    if (characters.length !== selectedPcIds.length) {
      throw new ApiError(400, 'One or more characters not found or not owned by you');
    }

    // Check level recommendations (warning only)
    const levelWarnings: string[] = [];
    characters.forEach((char) => {
      if (char.level < campaignDef.recommendedLevel.min) {
        levelWarnings.push(`${char.name} (level ${char.level}) is below the recommended level ${campaignDef.recommendedLevel.min}`);
      } else if (char.level > campaignDef.recommendedLevel.max) {
        levelWarnings.push(`${char.name} (level ${char.level}) is above the recommended level ${campaignDef.recommendedLevel.max}`);
      }
    });

    // Create instance
    const instance = await CampaignInstance.create({
      userId: req.user!._id,
      campaignDefId: campaignDef._id,
      worldId: campaignDef.worldId,
      branchId: 'root',
      title,
      selectedPcIds: pcIds,
      lastPlayedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        instance,
        warnings: levelWarnings.length > 0 ? levelWarnings : undefined,
      },
    });
  })
);

/**
 * GET /campaign-instances/mine
 * List user's campaign instances
 */
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const instances = await CampaignInstance.find({ userId: req.user!._id })
      .populate('campaignDefId', 'title shortDescription')
      .populate('selectedPcIds', 'name class level')
      .sort({ lastPlayedAt: -1 });

    res.json({
      success: true,
      data: instances,
    });
  })
);

/**
 * GET /campaign-instances/:id
 * Get a specific campaign instance (owner only)
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const instance = await CampaignInstance.findById(req.params.id)
      .populate('campaignDefId')
      .populate('selectedPcIds')
      .populate('currentSnapshotId');

    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only view your own campaign instances');
    }

    res.json({
      success: true,
      data: instance,
    });
  })
);

/**
 * POST /campaign-instances/:id/fork
 * Create a new branch from a snapshot or current state
 */
router.post(
  '/:id/fork',
  requireAuth,
  validate(forkCampaignInstanceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { fromSnapshotId, newBranchName } = req.body;

    const instance = await CampaignInstance.findById(req.params.id);
    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only fork your own campaigns');
    }

    // Generate new branch ID
    const newBranchId = newBranchName || `branch_${uuidv4().slice(0, 8)}`;

    // Get source snapshot
    let sourceSnapshot;
    if (fromSnapshotId) {
      sourceSnapshot = await Snapshot.findById(fromSnapshotId);
      if (!sourceSnapshot || sourceSnapshot.instanceId.toString() !== instance._id.toString()) {
        throw new ApiError(404, 'Snapshot not found for this instance');
      }
    } else if (instance.currentSnapshotId) {
      sourceSnapshot = await Snapshot.findById(instance.currentSnapshotId);
    }

    // Create new branch instance
    const forkedInstance = await CampaignInstance.create({
      userId: req.user!._id,
      campaignDefId: instance.campaignDefId,
      worldId: instance.worldId,
      branchId: newBranchId,
      title: `${instance.title} (${newBranchId})`,
      selectedPcIds: instance.selectedPcIds,
      lastPlayedAt: new Date(),
    });

    // If we have a source snapshot, create a copy for the new branch
    if (sourceSnapshot) {
      const newSnapshot = await Snapshot.create({
        instanceId: forkedInstance._id,
        branchId: newBranchId,
        sequence: sourceSnapshot.sequence,
        state: sourceSnapshot.state,
      });

      await CampaignInstance.findByIdAndUpdate(forkedInstance._id, {
        currentSnapshotId: newSnapshot._id,
      });

      forkedInstance.currentSnapshotId = newSnapshot._id;
    }

    // Record branch creation event
    await Event.create({
      instanceId: forkedInstance._id,
      branchId: newBranchId,
      sequence: 0,
      type: 'BranchCreated',
      payload: {
        parentBranchId: instance.branchId,
        parentInstanceId: instance._id,
        fromSnapshotId,
      },
    });

    res.status(201).json({
      success: true,
      data: forkedInstance,
    });
  })
);

// ============== Events ==============

/**
 * POST /campaign-instances/:id/events
 * Append an event for the current branch
 */
router.post(
  '/:id/events',
  requireAuth,
  validate(createEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { branchId, type, payload } = req.body;

    const instance = await CampaignInstance.findById(req.params.id);
    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only add events to your own campaigns');
    }

    // Get next sequence number
    const lastEvent = await Event.findOne({
      instanceId: instance._id,
      branchId,
    }).sort({ sequence: -1 });

    const sequence = lastEvent ? lastEvent.sequence + 1 : 1;

    const event = await Event.create({
      instanceId: instance._id,
      branchId,
      sequence,
      type,
      payload,
    });

    // Update lastPlayedAt
    await CampaignInstance.findByIdAndUpdate(instance._id, {
      lastPlayedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  })
);

/**
 * GET /campaign-instances/:id/events
 * List events for a campaign instance
 */
router.get(
  '/:id/events',
  requireAuth,
  validateQuery(eventQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { branchId, fromSequence, toSequence, type } = req.query as {
      branchId?: string;
      fromSequence?: number;
      toSequence?: number;
      type?: string;
    };

    const instance = await CampaignInstance.findById(req.params.id);
    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only view events for your own campaigns');
    }

    const query: Record<string, unknown> = { instanceId: instance._id };

    if (branchId) query.branchId = branchId;
    if (type) query.type = type;
    if (fromSequence !== undefined || toSequence !== undefined) {
      query.sequence = {};
      if (fromSequence !== undefined) (query.sequence as Record<string, number>).$gte = fromSequence;
      if (toSequence !== undefined) (query.sequence as Record<string, number>).$lte = toSequence;
    }

    const events = await Event.find(query).sort({ sequence: 1 });

    res.json({
      success: true,
      data: events,
    });
  })
);

// ============== Snapshots ==============

/**
 * POST /campaign-instances/:id/snapshots
 * Create a snapshot of current state
 */
router.post(
  '/:id/snapshots',
  requireAuth,
  validate(createSnapshotSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { branchId, state } = req.body;

    const instance = await CampaignInstance.findById(req.params.id);
    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only create snapshots for your own campaigns');
    }

    // Get latest event sequence for this branch
    const lastEvent = await Event.findOne({
      instanceId: instance._id,
      branchId,
    }).sort({ sequence: -1 });

    const sequence = lastEvent ? lastEvent.sequence : 0;

    const snapshot = await Snapshot.create({
      instanceId: instance._id,
      branchId,
      sequence,
      state,
    });

    // Update instance's current snapshot
    await CampaignInstance.findByIdAndUpdate(instance._id, {
      currentSnapshotId: snapshot._id,
      lastPlayedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: snapshot,
    });
  })
);

/**
 * GET /campaign-instances/:id/snapshots/latest
 * Get latest snapshot for a branch
 */
router.get(
  '/:id/snapshots/latest',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { branchId } = req.query;

    const instance = await CampaignInstance.findById(req.params.id);
    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only view snapshots for your own campaigns');
    }

    const query: Record<string, unknown> = { instanceId: instance._id };
    if (branchId) query.branchId = branchId;

    const snapshot = await Snapshot.findOne(query).sort({ createdAt: -1 });

    if (!snapshot) {
      throw new ApiError(404, 'No snapshot found');
    }

    res.json({
      success: true,
      data: snapshot,
    });
  })
);

// ============== Inventory Helpers ==============

/**
 * POST /campaign-instances/:id/items/transfer
 * Transfer an item between PC / party / world
 */
router.post(
  '/:id/items/transfer',
  requireAuth,
  validate(transferItemSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { branchId, instanceItemId, from, to, quantity = 1 } = req.body;

    const instance = await CampaignInstance.findById(req.params.id);
    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only manage items in your own campaigns');
    }

    // Get next event sequence
    const lastEvent = await Event.findOne({
      instanceId: instance._id,
      branchId,
    }).sort({ sequence: -1 });

    const sequence = lastEvent ? lastEvent.sequence + 1 : 1;

    // Record ItemLost event
    await Event.create({
      instanceId: instance._id,
      branchId,
      sequence,
      type: 'ItemLost',
      payload: {
        instanceItemId,
        from,
        quantity,
      },
    });

    // Record ItemGained event
    await Event.create({
      instanceId: instance._id,
      branchId,
      sequence: sequence + 1,
      type: 'ItemGained',
      payload: {
        instanceItemId,
        to,
        quantity,
      },
    });

    res.json({
      success: true,
      data: {
        transferred: {
          instanceItemId,
          from,
          to,
          quantity,
        },
        eventsCreated: 2,
      },
    });
  })
);

/**
 * POST /campaign-instances/:id/items/use
 * Use/consume an item
 */
router.post(
  '/:id/items/use',
  requireAuth,
  validate(useItemSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { branchId, instanceItemId, pcId, targetId, quantity = 1 } = req.body;

    const instance = await CampaignInstance.findById(req.params.id);
    if (!instance) {
      throw new ApiError(404, 'Campaign instance not found');
    }

    if (instance.userId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only use items in your own campaigns');
    }

    // Get next event sequence
    const lastEvent = await Event.findOne({
      instanceId: instance._id,
      branchId,
    }).sort({ sequence: -1 });

    const sequence = lastEvent ? lastEvent.sequence + 1 : 1;

    // Record ItemUsed event
    const event = await Event.create({
      instanceId: instance._id,
      branchId,
      sequence,
      type: 'ItemUsed',
      payload: {
        instanceItemId,
        usedByPcId: pcId,
        targetId,
        quantity,
      },
    });

    res.json({
      success: true,
      data: event,
    });
  })
);

export default router;
