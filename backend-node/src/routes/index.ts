import { Router } from 'express';

// Import all routers
import authRouter from './auth';
import worldsRouter from './worlds';
import assetPacksRouter from './assetPacks';
import { npcTemplatesRouter, bestiaryRouter, itemTemplatesRouter, environmentTemplatesRouter } from './templates';
import campaignDefsRouter from './campaignDefs';
import playerCharactersRouter from './playerCharacters';
import campaignInstancesRouter from './campaignInstances';
import purchasesRouter from './purchases';
import aiRouter from './ai';

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
