import { Router } from "express";
import { checkAuth, checkRole } from "../../middlewares";
import { marketplaceController } from "./marketplace.controller";

const router = Router();

router.use(checkAuth, checkRole("CLIENTE", "EMPRESA", "ADMIN"));
router.get("/products", (req, res) => marketplaceController.listProducts(req, res));
router.get("/residues", (req, res) => marketplaceController.listResidues(req, res));

export default router;
