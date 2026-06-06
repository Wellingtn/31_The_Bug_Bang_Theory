import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { verificationsService } from "./verifications.service";
import { VerificationStatus } from "@prisma/client";

export class VerificationsController {
  async findMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const verifications = await verificationsService.findByProducer(req.user!.userId);
      res.json(verifications);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar verificações";
      res.status(500).json({ error: message });
    }
  }

  async request(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { notes } = req.body;
      const verification = await verificationsService.request(req.user!.userId, notes);
      res.status(201).json(verification);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao solicitar verificação";
      res.status(400).json({ error: message });
    }
  }

  async findAll(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const verifications = await verificationsService.findAll();
      res.json(verifications);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar verificações";
      res.status(500).json({ error: message });
    }
  }

  async review(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, notes } = req.body;
      if (!Object.values(VerificationStatus).includes(status)) {
        res.status(400).json({ error: "Status inválido" });
        return;
      }
      const verification = await verificationsService.review(req.params.id, status, notes);
      res.json(verification);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao revisar verificação";
      res.status(400).json({ error: message });
    }
  }
}

export const verificationsController = new VerificationsController();
