import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { usersService } from "./users.service";

export class UsersController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await usersService.findAll();
      res.json(users);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar usuários";
      res.status(500).json({ error: message });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await usersService.findById(id);

      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      res.json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar usuário";
      res.status(500).json({ error: message });
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      const user = await usersService.findById(req.user.userId);

      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      res.json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar perfil";
      res.status(500).json({ error: message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: "Nome e email são obrigatórios" });
        return;
      }

      const user = await usersService.create({ name, email, password, role });
      res.status(201).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar usuário";
      res.status(400).json({ error: message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, password, role } = req.body;

      const user = await usersService.update(id, { name, email, password, role });
      res.json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar usuário";
      res.status(400).json({ error: message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await usersService.delete(id);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover usuário";
      res.status(400).json({ error: message });
    }
  }
}

export const usersController = new UsersController();
