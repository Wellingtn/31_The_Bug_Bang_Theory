import { Router } from "express";
import { companyRequestsController } from "./company-requests.controller";
import { checkAuth, checkRole } from "../../middlewares";

const router = Router();

// Público: envio do formulário comercial
router.post("/", (req, res) => companyRequestsController.create(req, res));

// Admin: listagem e gestão de status
router.get("/", checkAuth, checkRole("ADMIN"), (req, res) =>
  companyRequestsController.findAll(req, res)
);
router.patch("/:id/status", checkAuth, checkRole("ADMIN"), (req, res) =>
  companyRequestsController.updateStatus(req, res)
);

export default router;
