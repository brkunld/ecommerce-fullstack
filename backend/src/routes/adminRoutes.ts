import { Router } from "express";
import {
  getDashboardStatsController,
  getAllUsersController,
  getUserByIdController,
  updateUserRoleController,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { updateUserRoleSchema } from "../validators/authValidator.js";

const router: Router = Router();

// 🔒 Tüm admin rotaları için oturum açılmış ve ADMIN rolüne sahip olunmalıdır
router.use(authenticate, authorize("ADMIN"));

// GET /api/admin/stats
router.route("/stats").get(getDashboardStatsController);

// Kullanıcı Yönetimi
router.route("/users").get(getAllUsersController);
router.route("/users/:id").get(getUserByIdController);
router.route("/users/:id/role").patch(validate(updateUserRoleSchema), updateUserRoleController);

export default router;
