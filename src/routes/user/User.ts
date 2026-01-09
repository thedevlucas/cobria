// Dependencies
import express, { Request, Response } from "express";
// Services
import {
  changePassword,
  getName,
  deleteSelf,
  getCellphone,
  getTelephone,
} from "../../services/user/UserService";
// Custom error
import { errorHandler } from "../../config/CustomError";
// Schemas
import { changePasswordValidator } from "../../schemas/UserSchema";
// Helpers
import { verifyToken } from "../../helpers/Token";
import { GetMyInfo } from "../../Contexts/BillingPlatform/company/application/use-cases/GetMyInfo";
import { companyRepository } from "../../Contexts/Shared/infrastructure/dependencies";

const router = express.Router();

router.patch("/", verifyToken, changePasswordValidator, async (req, res) => {
  try {
    const response = await changePassword(
      Number(req.params.idToken),
      req.body.oldPassword,
      req.body.newPassword
    );
    res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.delete("/", verifyToken, async (req, res) => {
  try {
    const response = await deleteSelf(Number(req.params.idToken));
    res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get("/name", verifyToken, async (req, res) => {
  try {
    const response = await getName(Number(req.params.idToken));
    res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get("/cellphone", verifyToken, async (req, res) => {
  try {
    const response = await getCellphone(Number(req.params.idToken));
    res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get("/telephone", verifyToken, async (req, res) => {
  try {
    const response = await getTelephone(Number(req.params.idToken));
    res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const getMyInfoUseCase = new GetMyInfo(companyRepository);

    const company = await getMyInfoUseCase.run({
      idCompany: Number(req.params.idToken),
    });

    return res.status(200).json(company);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;
