import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { residuesService } from "./residues.service";
import { ResidueStatus } from "@prisma/client";

export class ResiduesController {
  // Produtor: lista os próprios resíduos
  async findMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const residues = await residuesService.findByProducer(req.user!.userId);
      res.json(residues);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar resíduos";
      res.status(500).json({ error: message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type, quantity, unit, description } = req.body;
      if (!type || quantity === undefined || !unit) {
        res.status(400).json({ error: "Tipo, quantidade e unidade são obrigatórios" });
        return;
      }
      const residue = await residuesService.create(req.user!.userId, {
        type,
        quantity: Number(quantity),
        unit,
        description,
      });
      res.status(201).json(residue);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar resíduo";
      res.status(400).json({ error: message });
    }
  }

  async deleteMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await residuesService.deleteOwn(req.user!.userId, req.params.id);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover resíduo";
      res.status(400).json({ error: message });
    }
  }

  // Admin
  async findAll(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const residues = await residuesService.findAll();
      res.json(residues);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar resíduos";
      res.status(500).json({ error: message });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!Object.values(ResidueStatus).includes(status)) {
        res.status(400).json({ error: "Status inválido" });
        return;
      }
      const residue = await residuesService.updateStatus(req.params.id, status);
      res.json(residue);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status";
      res.status(400).json({ error: message });
    }
  }
}

export const residuesController = new ResiduesController();
