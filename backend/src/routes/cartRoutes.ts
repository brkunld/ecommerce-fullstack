import { Router } from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cartController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/cartValidator.js";

const router: Router = Router();

// Tüm sepet rotaları giriş yapmayı zorunlu kılar
router.use(authenticate);

router.get("/", getCartController);
router.post("/items", validate(addToCartSchema), addToCartController);

router.patch(
  "/items/:id",
  validate(updateCartItemSchema),
  updateCartItemController,
);

router.delete("/items/:id", removeFromCartController);
router.delete("/", clearCartController);
export default router;
