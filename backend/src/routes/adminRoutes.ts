// backend/src/routes/adminRoutes.ts
import { Router } from "express";
import { getDashboardStatsController } from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router: Router = Router();

// 🔒 Tüm admin rotaları için oturum açılmış ve ADMIN rolüne sahip olunmalıdır
router.use(authenticate, authorize("ADMIN"));

// GET /api/admin/stats
router.route("/stats").get(getDashboardStatsController);

export default router;
