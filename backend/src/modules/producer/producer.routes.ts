import { Router } from "express";
import { checkAuth, checkRole } from "../../middlewares";
import { producerController } from "./producer.controller";

const router = Router();

router.use(checkAuth, checkRole("PRODUTOR"));

router.get("/products", (req, res) => producerController.listProducts(req, res));
router.post("/products", (req, res) => producerController.createProduct(req, res));
router.get("/residues", (req, res) => producerController.listResidues(req, res));
router.post("/residues", (req, res) => producerController.createResidue(req, res));
router.get("/solicitations", (req, res) => producerController.listSolicitations(req, res));
router.patch("/solicitations/:id/respond", (req, res) => producerController.respondSolicitation(req, res));

export default router;
