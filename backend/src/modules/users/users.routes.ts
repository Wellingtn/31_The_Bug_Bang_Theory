import { Router } from "express";
import { usersController } from "./users.controller";
import { checkAuth, checkRole } from "../../middlewares";

const router = Router();

// Rotas protegidas por autenticação
router.use(checkAuth);

// Rota para obter o próprio perfil (qualquer usuário autenticado)
router.get("/me", (req, res) => usersController.getMe(req, res));

// Rotas CRUD protegidas por role ADMIN
router.get("/", checkRole("ADMIN"), (req, res) => usersController.findAll(req, res));
router.get("/:id", checkRole("ADMIN"), (req, res) => usersController.findById(req, res));
router.post("/", checkRole("ADMIN"), (req, res) => usersController.create(req, res));
router.put("/:id", checkRole("ADMIN"), (req, res) => usersController.update(req, res));
router.delete("/:id", checkRole("ADMIN"), (req, res) => usersController.delete(req, res));

export default router;
