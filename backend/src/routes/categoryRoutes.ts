import { Router } from "express";
import {
  deleteCategoryController,
  updateCategoryController,
  createCategoryController,
  getCategoryBySlugController,
  getCategory,
  getAllCategories,
} from "../controllers/categoryController.js";
import { authorize, authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  updateCategorySchema,
  createCategorySchema,
} from "../validators/categoryValidator.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/slug/:slug", getCategoryBySlugController);
router.get("/:id", getCategory);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategoryController,
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  updateCategoryController,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteCategoryController,
);

export default router;
