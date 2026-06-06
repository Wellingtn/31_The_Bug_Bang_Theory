import { Response } from "express";
import { ItemKind } from "@prisma/client";
import { AuthRequest } from "../../middlewares";
import { ordersService } from "./orders.service";

function parseQuantity(value: unknown): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("Quantidade deve ser maior que zero");
  }
  return parsed;
}

function parseItemKind(value: unknown): ItemKind {
  if (value !== "PRODUTO" && value !== "RESIDUO") {
    throw new Error("Tipo do item deve ser PRODUTO ou RESIDUO");
  }
  return value;
}

export class OrdersController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { itemKind, itemName, quantity, unit, notes } = req.body;

      if (!itemName || !unit) {
        res.status(400).json({ error: "Item e unidade são obrigatórios" });
        return;
      }

      const order = await ordersService.create({
        requesterId: req.user!.userId,
        requesterType: req.user!.role as "CLIENTE" | "EMPRESA",
        itemKind: parseItemKind(itemKind),
        itemName: String(itemName),
        quantity: parseQuantity(quantity),
        unit: String(unit),
        notes: notes ? String(notes) : undefined,
      });

      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar pedido" });
    }
  }

  async listMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orders = await ordersService.listMine(req.user!.userId);
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao listar pedidos" });
    }
  }
}

export const ordersController = new OrdersController();
