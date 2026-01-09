import express, { Request, Response } from "express";
import { AddClient } from "../../Contexts/BillingPlatform/company/application/use-cases/AddClient";
import {
  agentRepository,
  companyRepository,
  ticketRepository,
} from "../../Contexts/Shared/infrastructure/dependencies";
import { errorHandler } from "../../config/CustomError";
import { verifyToken } from "../../helpers/Token";
import { GetClientsByCompany } from "../../Contexts/BillingPlatform/company/application/use-cases/GetClientsByCompany.ts";
import { RemoveClient } from "../../Contexts/BillingPlatform/company/application/use-cases/RemoveClient";
import { UpdateClient } from "../../Contexts/BillingPlatform/company/application/use-cases/UpdateClient";
import { ConfigureMessageScheduling } from "../../Contexts/BillingPlatform/company/application/use-cases/ConfigureMessageSchedule";
import { RequestAgents } from "../../Contexts/BillingPlatform/company/application/use-cases/RequestAgents";
import { NodemailerEmailService } from "../../Contexts/Shared/infrastructure/email/NodemailerEmailService";
import { ListMyAgents } from "../../Contexts/BillingPlatform/company/application/use-cases/ListMyAgents";
import { ListMessageSchedule } from "../../Contexts/BillingPlatform/company/application/use-cases/ListMessageSchedule";
import { SendSupportTicket } from "../../Contexts/BillingPlatform/company/application/use-cases/SendSupportTicket";

const router = express.Router();

router.get("/client", verifyToken, async (req: Request, res: Response) => {
  try {
    const getClientsByCompanyUseCase = new GetClientsByCompany(
      companyRepository
    );

    const clients = await getClientsByCompanyUseCase.run({
      companyId: Number(req.params.idToken),
    });

    return res.status(200).json(clients);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post("/client", verifyToken, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const addClientUseCase = new AddClient(companyRepository);

    await addClientUseCase.run({
      idCompany: Number(req.params.idToken),
      name: body.name,
      activity: body.activity,
      address: body.address,
      service: body.service,
      segment: body.segment,
      phone: body.phone,
    });

    return res.send({
      message: "Cliente agregado",
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.delete(
  "/client/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const removeClientUseCase = new RemoveClient(companyRepository);

      await removeClientUseCase.run({
        companyId: Number(req.params.idToken),
        clientId: Number(req.params.id),
      });

      return res.status(200).json({ message: "Cliente eliminado" });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.put("/client/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const updateClientUseCase = new UpdateClient(companyRepository);

    await updateClientUseCase.run({
      id: Number(req.params.id),
      name: body.name,
      activity: body.activity,
      address: body.address,
      service: body.service,
      segment: body.segment,
      idCompany: Number(req.params.idToken),
      phone: body.phone,
    });

    return res.status(200).json({ message: "Cliente actualizado" });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post(
  "/config/messages-schedule",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const body: {
        days_of_week: number[];
        start_time: string;
        end_time: string;
        timezone: string;
      } = req.body;

      const configureMessageSchedulingUseCase = new ConfigureMessageScheduling(
        companyRepository
      );

      await configureMessageSchedulingUseCase.run({
        companyId: Number(req.params.idToken),
        endTime: body.end_time,
        startTime: body.start_time,
        daysOfWeek: body.days_of_week,
        timezone: body.timezone,
      });

      return res.send({
        message: "Horario de mensajes configurado",
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.get(
  "/message-schedule",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const listMessageScheduleUseCase = new ListMessageSchedule(
        companyRepository
      );

      const schedules = await listMessageScheduleUseCase.run({
        idCompany: Number(req.params.idToken),
      });

      return res.send({
        data: schedules,
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.post(
  "/request-agents",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const body = req.body;

      const requestAgentsUseCase = new RequestAgents(
        new NodemailerEmailService(),
        companyRepository,
        ticketRepository
      );

      await requestAgentsUseCase.run({
        idCompany: Number(req.params.idToken),
        agents: body.agents,
      });

      return res.send({
        message: "Solicitud de agentes enviada",
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.get("/agents", verifyToken, async (req: Request, res: Response) => {
  try {
    const listMyAgentsUseCase = new ListMyAgents(
      companyRepository,
      agentRepository
    );

    const agents = await listMyAgentsUseCase.run({
      idCompany: Number(req.params.idToken),
    });

    return res.send({
      agents,
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post(
  "/support-ticket",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const body = req.body;

      const sendSupportTicketUseCase = new SendSupportTicket(
        new NodemailerEmailService(),
        companyRepository,
        ticketRepository
      );

      await sendSupportTicketUseCase.run({
        idUser: Number(req.params.idToken),
        subject: body.subject,
        message: body.message,
      });

      return res.send({
        message: "Ticket de soporte enviado",
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

module.exports = router;
