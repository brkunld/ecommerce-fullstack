import { Router, type Request, type Response } from "express";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";

const router: Router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "E-Ticaret REST API sorunsuz çalışıyor!",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);

export default router;
