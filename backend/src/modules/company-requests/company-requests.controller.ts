import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares";
import { companyRequestsService } from "./company-requests.service";
import { CompanyRequestStatus } from "@prisma/client";

// Sanitização simples: converte para string e remove espaços nas pontas
const sanitize = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export class CompanyRequestsController {
  // Público: formulário "Para Empresas"
  async create(req: Request, res: Response): Promise<void> {
    try {
      const companyName = sanitize(req.body.companyName);
      const cnpj = sanitize(req.body.cnpj);
      const responsibleName = sanitize(req.body.responsibleName);
      const phone = sanitize(req.body.phone);
      const email = sanitize(req.body.email);
      const city = sanitize(req.body.city);
      const state = sanitize(req.body.state);
      const country = sanitize(req.body.country);
      const desiredMaterial = sanitize(req.body.desiredMaterial);
      const monthlyQuantity = sanitize(req.body.monthlyQuantity);
      const purchaseFrequency = sanitize(req.body.purchaseFrequency);
      const notes = sanitize(req.body.notes);

      if (
        !companyName ||
        !cnpj ||
        !responsibleName ||
        !phone ||
        !email ||
        !city ||
        !state ||
        !desiredMaterial ||
        !monthlyQuantity ||
        !purchaseFrequency
      ) {
        res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: "E-mail inválido" });
        return;
      }

      const request = await companyRequestsService.create({
        companyName,
        cnpj,
        responsibleName,
        phone,
        email,
        city,
        state,
        country: country || undefined,
        desiredMaterial,
        monthlyQuantity,
        purchaseFrequency,
        notes: notes || undefined,
      });

      res.status(201).json({
        message: "Solicitação recebida com sucesso",
        id: request.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar solicitação";
      res.status(400).json({ error: message });
    }
  }

  // Admin
  async findAll(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const requests = await companyRequestsService.findAll();
      res.json(requests);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar solicitações";
      res.status(500).json({ error: message });
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!Object.values(CompanyRequestStatus).includes(status)) {
        res.status(400).json({ error: "Status inválido" });
        return;
      }
      const request = await companyRequestsService.updateStatus(req.params.id, status);
      res.json(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status";
      res.status(400).json({ error: message });
    }
  }
}

export const companyRequestsController = new CompanyRequestsController();
