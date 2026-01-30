import express from 'express';
import { verifyToken } from '../../helpers/Token';
import { errorHandler } from '../../config/CustomError';
import { CollectionService } from '../../services/collection/CollectionService';

const router = express.Router();

router.get('/stages', verifyToken, async (req, res) => {
  try { res.json({ success: true, data: await CollectionService.getCollectionStages(Number(req.params.idToken)) }); }
  catch (e) { errorHandler(e, res); }
});

router.get('/debtors', verifyToken, async (req, res) => {
  try { res.json({ success: true, data: await CollectionService.getDebtorsWithProgress(Number(req.params.idToken)) }); }
  catch (e) { errorHandler(e, res); }
});

router.get('/stats', verifyToken, async (req, res) => {
  try { res.json({ success: true, data: await CollectionService.getCollectionStats(Number(req.params.idToken)) }); }
  catch (e) { errorHandler(e, res); }
});

router.post('/stages', verifyToken, async (req, res) => {
  try {
    const data = await CollectionService.createStage(Number(req.params.idToken), req.body);
    res.json({ success: true, data });
  } catch (e) { errorHandler(e, res); }
});

router.delete('/stages/:id', verifyToken, async (req, res) => {
  try {
    await CollectionService.deleteStage(Number(req.params.id));
    res.json({ success: true, message: "Etapa eliminada" });
  } catch (e) { errorHandler(e, res); }
});

router.post('/move-debtor', verifyToken, async (req, res) => {
  try {
    const { debtor_id, new_stage_id } = req.body;
    await CollectionService.moveDebtorToStage(debtor_id, new_stage_id);
    res.json({ success: true });
  } catch (e) { errorHandler(e, res); }
});

router.get('/campaigns', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);
    const campaigns = await CollectionService.getActiveCampaigns(userId);

    // IMPORTANTE: El frontend espera { success: true, data: [...] }
    res.json({ 
      success: true, 
      data: campaigns 
    });
  } catch (e) {
    errorHandler(e, res);
  }
});

router.post('/campaigns', verifyToken, async (req, res) => {
  try {
    const idUser = Number(req.params.idToken);
    const data = await CollectionService.createCampaign(idUser, req.body);
    res.json({ success: true, data });
  } catch (e) { 
    errorHandler(e, res); 
  }
});

router.delete('/campaigns/:id', verifyToken, async (req, res) => {
  try {
    await CollectionService.deleteCampaign(Number(req.params.id));
    res.json({ success: true, message: "Campaña eliminada" });
  } catch (e) { errorHandler(e, res); }
});

router.post('/update-debtor-campaign', verifyToken, async (req, res) => {
  try {
    const { debtor_id, campaign_id } = req.body;
    await CollectionService.updateDebtorCampaign(debtor_id, campaign_id);
    res.json({ success: true, message: "Deudor reasignado" });
  } catch (e) { errorHandler(e, res); }
});

router.post('/register-payment', verifyToken, async (req, res) => {
  try {
    const { debtor_id, amount, type } = req.body; // <--- Recibimos 'type'
    const userId = Number(req.params.idToken);

    await CollectionService.registerPayment(userId, debtor_id, amount, type);
    res.json({ success: true });
  } catch (e) { errorHandler(e, res); }
});

module.exports = router;