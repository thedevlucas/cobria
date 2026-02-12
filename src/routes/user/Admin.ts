// Dependencies
import express, { Request, Response } from "express";
// Services
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changeStateUser,
} from "../../services/user/AdminService";
// Schemas
import {
  createUserValidator,
  modifyUserValidator,
} from "../../schemas/UserSchema";
// Helpers
import { checkAdmin } from "../../helpers/user/UserHelper";
import { verifyToken } from "../../helpers/Token";
// Custom error
import { errorHandler, httpError } from "../../config/CustomError";
import { SetAgentToCompany } from "../../Contexts/Backoffice/admin/application/use-cases/SetAgentToCompany";
import {
  agentRepository,
  companyRepository,
  costRepository,
  ticketRepository,
} from "../../Contexts/Shared/infrastructure/dependencies";
import { GetAllTickets } from "../../Contexts/Backoffice/admin/application/use-cases/GetAllTickets";
import { TicketType } from "../../Contexts/BillingPlatform/company/domain/Ticket";
import { CloseTicket } from "../../Contexts/Backoffice/admin/application/use-cases/CloseTicket";
import { GetCostsGrouped } from "../../Contexts/BillingPlatform/cost/application/use-cases/GetCostsGrouped";
import { GetAgentsAssociated } from "../../Contexts/BillingPlatform/agent/application/GetAgentsAssociated";
import { GetAgentsAssociatedWithUser } from "../../Contexts/BillingPlatform/company/application/use-cases/GetAgentsAssociatedWithUser";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post(
  "/",
  verifyToken,
  checkAdmin,
  createUserValidator,
  async (req, res) => {
    try {
      const response = await createUser(req.body, Number(req.params.idToken));
      res.status(200).json(response);
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.put(
  "/:id",
  verifyToken,
  checkAdmin,
  modifyUserValidator,
  async (req, res) => {
    try {
      const response = await updateUser(
        Number(req.params.id),
        req.body,
        Number(req.params.idToken)
      );
      res.status(200).json(response);
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.delete("/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const response = await deleteUser(
      Number(req.params.id),
      Number(req.params.idToken)
    );
    res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.patch("/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const response = await changeStateUser(
      Number(req.params.id),
      Number(req.params.idToken)
    );
    res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post("/set-agent", verifyToken, checkAdmin, async (req, res) => {
  try {
    const body = req.body;

    const setAgentToCompanyUseCase = new SetAgentToCompany(
      companyRepository,
      agentRepository,
      costRepository
    );

    const cleanedPhone = body?.phone?.replace(/\s+/g, "") || "";

    await setAgentToCompanyUseCase.run({
      idCompany: body.idCompany,
      name: body.name,
      phone: cleanedPhone,
      monthsToExpire: body.months || 1,
      price: body.price || 0,
    });

    return res.send({
      message: "Agente asociado a la compañía",
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get(
  "/agents",
  verifyToken,
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const getAgentsAssociated = new GetAgentsAssociatedWithUser(
        companyRepository
      );
      const agents = await getAgentsAssociated.run();
      
      return res.status(200).json(agents);
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.get(
  "/tickets",
  verifyToken,
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const getAllTicketsUseCase = new GetAllTickets(ticketRepository);

      const tickets = await getAllTicketsUseCase.run({
        type:
          req.query.type === "support"
            ? TicketType.SUPPORT
            : TicketType.REQUEST_AGENTS,
      });

      return res.send({
        data: tickets,
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.put(
  "/tickets/:id",
  verifyToken,
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const closeTicketUseCase = new CloseTicket(ticketRepository);

      await closeTicketUseCase.run({
        idTicket: parseInt(req.params.id),
      });

      return res.send({
        message: "Ticket cerrado",
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

/* Getting costs of services */
router.get(
  "/costs",
  verifyToken,
  checkAdmin,
  async (req: Request, res: Response) => {
    try {
      const getCostGroupById = new GetCostsGrouped(costRepository);
      const costs = await getCostGroupById.run();
      return res.send({
        data: costs,
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

module.exports = router;