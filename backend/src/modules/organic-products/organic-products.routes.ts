import { Router } from "express";
import { organicProductsController } from "./organic-products.controller";
import { checkAuth, checkRole } from "../../middlewares";

const router = Router();

router.use(checkAuth);

// Admin
router.get("/all", checkRole("ADMIN"), (req, res) => organicProductsController.findAll(req, res));

// Produtor
router.get("/", (req, res) => organicProductsController.findMine(req, res));
router.post("/", (req, res) => organicProductsController.create(req, res));
router.delete("/:id", (req, res) => organicProductsController.deleteMine(req, res));

export default router;
