import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { organicProductsService } from "./organic-products.service";

export class OrganicProductsController {
  async findMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await organicProductsService.findByProducer(req.user!.userId);
      res.json(products);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar produtos";
      res.status(500).json({ error: message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, quantity, unit } = req.body;
      if (!name || quantity === undefined || !unit) {
        res.status(400).json({ error: "Nome, quantidade e unidade são obrigatórios" });
        return;
      }
      const product = await organicProductsService.create(req.user!.userId, {
        name,
        description,
        quantity: Number(quantity),
        unit,
      });
      res.status(201).json(product);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar produto";
      res.status(400).json({ error: message });
    }
  }

  async deleteMine(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await organicProductsService.deleteOwn(req.user!.userId, req.params.id);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover produto";
      res.status(400).json({ error: message });
    }
  }

  async findAll(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await organicProductsService.findAll();
      res.json(products);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar produtos";
      res.status(500).json({ error: message });
    }
  }
}

export const organicProductsController = new OrganicProductsController();
