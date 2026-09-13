import { Router } from "express";
import {
  createOrderController,
  getMyOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
} from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/orderValidator.js";

const router: Router = Router();

// Tüm sipariş rotaları için giriş yapılmış olmalıdır
router.use(authenticate);

router.post("/", validate(createOrderSchema), createOrderController);
router.get("/", getMyOrderController);
router.get("/admin", authorize("ADMIN"), getAllOrdersController);
router.get("/:id", getOrderByIdController);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate(updateOrderStatusSchema),
  updateOrderStatusController,
);
export default router;
