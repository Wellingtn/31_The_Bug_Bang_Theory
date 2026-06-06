import { Response, NextFunction } from "express";
import { AuthRequest } from "./checkAuth";

export const checkRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Acesso não autorizado para este recurso" });
      return;
    }

    next();
  };
};
