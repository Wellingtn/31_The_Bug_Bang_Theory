import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import producerRoutes from "./modules/producer/producer.routes";
import marketplaceRoutes from "./modules/marketplace/marketplace.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import adminRoutes from "./modules/admin/admin.routes";

dotenv.config({ path: "../.env.local" });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/producer", producerRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
