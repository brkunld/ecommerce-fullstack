import { Router } from "express";
import {
  deleteProductController,
  updateProductController,
  createProductController,
  getProductBySlugController,
  getProductById,
  getAllProducts,
} from "../controllers/productController.js";
import { authorize, authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  updateProductSchema,
  createProductSchema,
} from "../validators/productValidator.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/slug/:slug", getProductBySlugController);
router.get("/:id", getProductById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  createProductController,
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateProductSchema),
  updateProductController,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteProductController,
);

export default router;
