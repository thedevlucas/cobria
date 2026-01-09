// Dependencies
import express from "express";
// Services
import {
  getTelephones,
  createTelephone,
  deleteTelephone,
} from "../../services/chat/TelephoneService";
// Schemas
import { telephoneValidator } from "../../schemas/TelephoneSchema";
// Custom error
import { errorHandler } from "../../config/CustomError";
// Helpers
import { verifyToken } from "../../helpers/Token";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const telephones = await getTelephones(Number(req.params.idToken));
    return res.status(200).json(telephones);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post("/", verifyToken, telephoneValidator, async (req, res) => {
  try {
    const response = await createTelephone(
      req.body,
      Number(req.params.idToken)
    );
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const response = await deleteTelephone(
      Number(req.params.id),
      Number(req.params.idToken)
    );
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;
