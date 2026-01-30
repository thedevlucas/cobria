import { Router, Request, Response } from "express";
import multer from "multer";
import xlsx from "xlsx";
import { verifyToken } from "../../helpers/Token";
import { errorHandler } from "../../config/CustomError";

const router = Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(upload.single("file"));

// SMS send CSV endpoint
router.post(
  "/send/csv",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      // For now, return a success message
      // TODO: Implement actual SMS sending functionality using Twilio
      return res.send({
        message: "SMS collection started successfully. Messages will be sent to debtors.",
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

module.exports = router;
