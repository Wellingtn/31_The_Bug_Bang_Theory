import { Router } from "express";
import { checkAuth, checkRole } from "../../middlewares";
import { adminController } from "./admin.controller";

const router = Router();

router.use(checkAuth, checkRole("ADMIN"));
router.get("/orders", (req, res) => adminController.listOrders(req, res));
router.get("/orders/:id/matches", (req, res) => adminController.findMatches(req, res));
router.post("/orders/:id/solicitations", (req, res) => adminController.sendSolicitation(req, res));
router.patch("/orders/:id/complete", (req, res) => adminController.completeOrder(req, res));

export default router;
