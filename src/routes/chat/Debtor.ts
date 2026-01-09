// Dependencies
import express from "express";
// Services
import {
  getDebtors,
  deleteDebtors,
  createDebtor,
  modifyDebtor,
} from "../../services/chat/DebtorService";
// Schemas
import {
  createDebtorValidator,
  modifyDebtorValidator,
} from "../../schemas/DebtorSchema";
// Helpers
import { verifyToken } from "../../helpers/Token";
// Custom error
import { errorHandler } from "../../config/CustomError";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const debtors = await getDebtors(Number(req.params.idToken));
    return res.status(200).json(debtors);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post("/", verifyToken, createDebtorValidator, async (req, res) => {
  try {
    await createDebtor(req.body, Number(req.params.idToken));
    return res.status(200).json({ message: "Cliente creado" });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const response = await deleteDebtors(
      Number(req.params.id),
      Number(req.params.idToken)
    );
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.put("/:id", verifyToken, modifyDebtorValidator, async (req, res) => {
  try {
    const response = await modifyDebtor(
      Number(req.params.id),
      req.body,
      Number(req.params.idToken)
    );
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;
