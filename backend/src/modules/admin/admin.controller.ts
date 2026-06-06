import { Response } from "express";
import { ItemKind } from "@prisma/client";
import { AuthRequest } from "../../middlewares";
import { adminService } from "./admin.service";

function parseItemKind(value: unknown): ItemKind {
  if (value !== "PRODUTO" && value !== "RESIDUO") {
    throw new Error("Tipo do item deve ser PRODUTO ou RESIDUO");
  }
  return value;
}

export class AdminController {
  async listOrders(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const orders = await adminService.listOrders();
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao listar pedidos" });
    }
  }

  async findMatches(req: AuthRequest, res: Response): Promise<void> {
    try {
      const matches = await adminService.findMatches(req.params.id);
      res.json(matches);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao buscar produtores" });
    }
  }

  async sendSolicitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { producerId, itemKind, listingId, message } = req.body;

      if (!producerId || !listingId) {
        res.status(400).json({ error: "Produtor e item são obrigatórios" });
        return;
      }

      const solicitation = await adminService.sendSolicitation(
        req.params.id,
        String(producerId),
        parseItemKind(itemKind),
        String(listingId),
        message ? String(message) : undefined
      );

      res.status(201).json(solicitation);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao enviar solicitação" });
    }
  }

  async completeOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const order = await adminService.completeOrder(req.params.id);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao concluir pedido" });
    }
  }
}

export const adminController = new AdminController();
