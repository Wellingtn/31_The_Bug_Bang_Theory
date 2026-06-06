import { Router } from "express";
import { residuesController } from "./residues.controller";
import { checkAuth, checkRole } from "../../middlewares";

const router = Router();

router.use(checkAuth);

// Admin: gestão de todos os resíduos e status
router.get("/all", checkRole("ADMIN"), (req, res) => residuesController.findAll(req, res));
router.patch("/:id/status", checkRole("ADMIN"), (req, res) => residuesController.updateStatus(req, res));

// Produtor: gestão dos próprios resíduos
router.get("/", (req, res) => residuesController.findMine(req, res));
router.post("/", (req, res) => residuesController.create(req, res));
router.delete("/:id", (req, res) => residuesController.deleteMine(req, res));

export default router;
