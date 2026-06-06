import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { marketplaceService } from "./marketplace.service";

export class MarketplaceController {
  async listProducts(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await marketplaceService.listProducts();
      res.json(products);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao listar produtos" });
    }
  }

  async listResidues(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const residues = await marketplaceService.listResidues();
      res.json(residues);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao listar resíduos" });
    }
  }
}

export const marketplaceController = new MarketplaceController();
