import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { producerService } from "./producer.service";

function parseNumber(value: unknown, field: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${field} deve ser um número válido`);
  }
  return parsed;
}

function readListingBody(body: Record<string, unknown>) {
  const { name, category, quantity, unit, price } = body;

  if (!name || !category || quantity === undefined || !unit || price === undefined) {
    throw new Error("Nome, categoria, quantidade, unidade e preço são obrigatórios");
  }

  return {
    name: String(name),
    category: String(category),
    quantity: parseNumber(quantity, "Quantidade"),
    unit: String(unit),
    price: parseNumber(price, "Preço"),
  };
}

export class ProducerController {
  async listProducts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await producerService.listProducts(req.user!.userId);
      res.json(products);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao listar produtos" });
    }
  }

  async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const product = await producerService.createProduct(req.user!.userId, readListingBody(req.body));
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar produto" });
    }
  }

  async listResidues(req: AuthRequest, res: Response): Promise<void> {
    try {
      const residues = await producerService.listResidues(req.user!.userId);
      res.json(residues);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao listar resíduos" });
    }
  }

  async createResidue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const residue = await producerService.createResidue(req.user!.userId, readListingBody(req.body));
      res.status(201).json(residue);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar resíduo" });
    }
  }

  async listSolicitations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const solicitations = await producerService.listSolicitations(req.user!.userId);
      res.json(solicitations);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao listar solicitações" });
    }
  }

  async respondSolicitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, responseMessage } = req.body;
      if (status !== "ACEITA" && status !== "RECUSADA") {
        res.status(400).json({ error: "Status deve ser ACEITA ou RECUSADA" });
        return;
      }

      const solicitation = await producerService.respondSolicitation(
        req.user!.userId,
        req.params.id,
        status,
        responseMessage ? String(responseMessage) : undefined
      );

      res.json(solicitation);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao responder solicitação" });
    }
  }
}

export const producerController = new ProducerController();
