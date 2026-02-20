import { Router, Request, Response } from 'express';
import { NpcTemplate, BestiaryEntry, ItemTemplate, EnvironmentTemplate } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import {
  createNpcTemplateSchema,
  createBestiaryEntrySchema,
  createItemTemplateSchema,
  createEnvironmentTemplateSchema,
} from '../schemas/index.js';

// ============== NPC Templates Router ==============
export const npcTemplatesRouter = Router();

npcTemplatesRouter.post(
  '/',
  requireAuth,
  validate(createNpcTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const template = await NpcTemplate.create({
      ...req.body,
      authorUserId: req.user!._id,
    });

    res.status(201).json({ success: true, data: template });
  })
);

npcTemplatesRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const templates = await NpcTemplate.find({ authorUserId: req.user!._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: templates });
  })
);

npcTemplatesRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const template = await NpcTemplate.findById(req.params.id);
    if (!template) {
      throw new ApiError(404, 'NPC template not found');
    }
    res.json({ success: true, data: template });
  })
);

// ============== Bestiary Router ==============
export const bestiaryRouter = Router();

bestiaryRouter.post(
  '/',
  requireAuth,
  validate(createBestiaryEntrySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const entry = await BestiaryEntry.create({
      ...req.body,
      authorUserId: req.user!._id,
    });

    res.status(201).json({ success: true, data: entry });
  })
);

bestiaryRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const entries = await BestiaryEntry.find({ authorUserId: req.user!._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: entries });
  })
);

bestiaryRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const entry = await BestiaryEntry.findById(req.params.id);
    if (!entry) {
      throw new ApiError(404, 'Bestiary entry not found');
    }
    res.json({ success: true, data: entry });
  })
);

// ============== Item Templates Router ==============
export const itemTemplatesRouter = Router();

itemTemplatesRouter.post(
  '/',
  requireAuth,
  validate(createItemTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const template = await ItemTemplate.create({
      ...req.body,
      authorUserId: req.user!._id,
    });

    res.status(201).json({ success: true, data: template });
  })
);

itemTemplatesRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const templates = await ItemTemplate.find({ authorUserId: req.user!._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: templates });
  })
);

itemTemplatesRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const template = await ItemTemplate.findById(req.params.id);
    if (!template) {
      throw new ApiError(404, 'Item template not found');
    }
    res.json({ success: true, data: template });
  })
);

// ============== Environment Templates Router ==============
export const environmentTemplatesRouter = Router();

environmentTemplatesRouter.post(
  '/',
  requireAuth,
  validate(createEnvironmentTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const template = await EnvironmentTemplate.create({
      ...req.body,
      authorUserId: req.user!._id,
    });

    res.status(201).json({ success: true, data: template });
  })
);

environmentTemplatesRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const templates = await EnvironmentTemplate.find({ authorUserId: req.user!._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: templates });
  })
);

environmentTemplatesRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const template = await EnvironmentTemplate.findById(req.params.id);
    if (!template) {
      throw new ApiError(404, 'Environment template not found');
    }
    res.json({ success: true, data: template });
  })
);
