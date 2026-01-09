// Collection Management API - Senior Full Stack Developer Implementation
import express from 'express';
import { verifyToken } from '../Token';
import { errorHandler } from '../../config/CustomError';
import { CollectionService } from '../../services/collection/CollectionService';

const router = express.Router();

// Get collection stages
router.get('/stages', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const stages = await CollectionService.getCollectionStages(idUser);
    res.json({
      success: true,
      data: stages
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Create new collection stage
router.post('/stages', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const stageData = req.body;
    const stage = await CollectionService.createCollectionStage(idUser, stageData);
    res.json({
      success: true,
      data: stage
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get debtors with their collection progress
router.get('/debtors', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const debtors = await CollectionService.getDebtorsWithProgress(idUser);
    res.json({
      success: true,
      data: debtors
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Move debtor to different stage
router.post('/move-debtor', verifyToken, async (req, res) => {
  try {
    const { debtor_id, new_stage } = req.body;
    const { idUser } = req.body;
    
    const result = await CollectionService.moveDebtorToStage(debtor_id, new_stage, idUser);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get collection statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const stats = await CollectionService.getCollectionStats(idUser);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get active campaigns
router.get('/campaigns', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const campaigns = await CollectionService.getActiveCampaigns(idUser);
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Create new campaign
router.post('/campaigns', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const campaignData = req.body;
    const campaign = await CollectionService.createCampaign(idUser, campaignData);
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Update campaign status
router.put('/campaigns/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { idUser } = req.body;
    
    const result = await CollectionService.updateCampaignStatus(parseInt(id), status, idUser);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get stage performance analytics
router.get('/analytics/stages', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const analytics = await CollectionService.getStageAnalytics(idUser);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get debtor timeline
router.get('/debtors/:id/timeline', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { idUser } = req.body;
    
    const timeline = await CollectionService.getDebtorTimeline(parseInt(id), idUser);
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Bulk stage operations
router.post('/bulk-move', verifyToken, async (req, res) => {
  try {
    const { debtor_ids, new_stage } = req.body;
    const { idUser } = req.body;
    
    const result = await CollectionService.bulkMoveDebtors(debtor_ids, new_stage, idUser);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;
