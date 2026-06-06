import { Router } from "express";
import { verificationsController } from "./verifications.controller";
import { checkAuth, checkRole } from "../../middlewares";

const router = Router();

router.use(checkAuth);

// Admin
router.get("/all", checkRole("ADMIN"), (req, res) => verificationsController.findAll(req, res));
router.patch("/:id/review", checkRole("ADMIN"), (req, res) => verificationsController.review(req, res));

// Produtor
router.get("/", (req, res) => verificationsController.findMine(req, res));
router.post("/", (req, res) => verificationsController.request(req, res));

export default router;
