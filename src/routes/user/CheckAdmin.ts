// Dependencies
import express from "express";
// Helpers
import { checkAdmin } from "../../helpers/user/UserHelper";
import { verifyToken } from "../../helpers/Token";
// Custom error
import { errorHandler } from "../../config/CustomError";
import { User } from "../../models/User";
import { Role } from "../../Contexts/BillingPlatform/company/domain/Company";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.idToken } });
    let admin = false;
    if (user && user.role == Role.USER) {
      admin = false;
    } else {
      admin = true;
    }
    return res.status(200).json({ admin });
  } catch (error: any) {
    return errorHandler(error, res);
  }
});

module.exports = router;
