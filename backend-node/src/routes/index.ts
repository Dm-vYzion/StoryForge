import { Router } from 'express';

// Import all routers
import authRouter from './auth.js';
import worldsRouter from './worlds.js';
import assetPacksRouter from './assetPacks.js';
import { npcTemplatesRouter, bestiaryRouter, itemTemplatesRouter, environmentTemplatesRouter } from './templates.js';
import campaignDefsRouter from './campaignDefs.js';
import playerCharactersRouter from './playerCharacters.js';
import campaignInstancesRouter from './campaignInstances.js';
import purchasesRouter from './purchases.js';
import aiRouter from './ai.js';

const router = Router();

// Health check
router.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routers
router.use('/auth', authRouter);
router.use('/worlds', worldsRouter);
router.use('/asset-packs', assetPacksRouter);
router.use('/npc-templates', npcTemplatesRouter);
router.use('/bestiary', bestiaryRouter);
router.use('/item-templates', itemTemplatesRouter);
router.use('/environment-templates', environmentTemplatesRouter);
router.use('/campaign-defs', campaignDefsRouter);
router.use('/player-characters', playerCharactersRouter);
router.use('/campaign-instances', campaignInstancesRouter);
router.use('/purchases', purchasesRouter);
router.use('/ai', aiRouter);

export default router;
