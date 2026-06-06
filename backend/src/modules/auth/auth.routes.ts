import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// Login tradicional
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

// Google OAuth
router.get("/google", (req, res) => authController.googleAuth(req, res));
router.get("/google/callback", (req, res) => authController.googleCallback(req, res));

// GitHub OAuth
router.get("/github", (req, res) => authController.githubAuth(req, res));
router.get("/github/callback", (req, res) => authController.githubCallback(req, res));

export default router;
