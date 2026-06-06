import { Request, Response } from "express";
import { authService } from "./auth.service";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ error: "Nome, email, senha e tipo de usuário são obrigatórios" });
        return;
      }

      const result = await authService.register({ name, email, password, role });
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao registrar";
      res.status(400).json({ error: message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email e senha são obrigatórios" });
        return;
      }

      const result = await authService.login({ email, password });
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer login";
      res.status(401).json({ error: message });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const url = authService.getGoogleAuthUrl();
    res.redirect(url);
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        res.status(400).json({ error: "Código de autorização não fornecido" });
        return;
      }

      const result = await authService.handleGoogleCallback(code);
      
      // Redireciona para o frontend com o token
      res.redirect(
        `http://localhost:5173/auth/callback?token=${result.token}&provider=google`
      );
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("http://localhost:5173/login?error=google_auth_failed");
    }
  }

  async githubAuth(req: Request, res: Response): Promise<void> {
    const url = authService.getGitHubAuthUrl();
    res.redirect(url);
  }

  async githubCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        res.status(400).json({ error: "Código de autorização não fornecido" });
        return;
      }

      const result = await authService.handleGitHubCallback(code);
      
      // Redireciona para o frontend com o token
      res.redirect(
        `http://localhost:5173/auth/callback?token=${result.token}&provider=github`
      );
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      res.redirect("http://localhost:5173/login?error=github_auth_failed");
    }
  }
}

export const authController = new AuthController();
