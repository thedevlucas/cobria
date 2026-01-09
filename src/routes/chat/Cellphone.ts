// Dependencies
import express from "express";
// Services
import {
  getCellphones,
  createCellphone,
  deleteCellphone,
} from "../../services/chat/CellService";
// Schemas
import { cellphoneValidator } from "../../schemas/CellphoneSchema";
// Custom error
import { errorHandler } from "../../config/CustomError";
// Helpers
import { verifyToken } from "../../helpers/Token";

const router = express.Router();

router.get("/:idToken", verifyToken, async (req, res) => {
  try {
    const cellphones = await getCellphones(Number(req.params.idToken));
    return res.status(200).json(cellphones);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post("/:idToken", verifyToken, cellphoneValidator, async (req, res) => {
  try {
    const response = await createCellphone(
      req.body,
      Number(req.params.idToken)
    );
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.delete("/:id/:idToken", verifyToken, async (req, res) => {
  try {
    const response = await deleteCellphone(
      Number(req.params.id),
      Number(req.params.idToken)
    );
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;