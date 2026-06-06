import { Router } from "express";
import { checkAuth, checkRole } from "../../middlewares";
import { ordersController } from "./orders.controller";

const router = Router();

router.use(checkAuth);
router.post("/", checkRole("CLIENTE", "EMPRESA"), (req, res) => ordersController.create(req, res));
router.get("/my", checkRole("CLIENTE", "EMPRESA"), (req, res) => ordersController.listMine(req, res));

export default router;
