import { Router, type Request, type Response } from 'express';

const router: Router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'E-Ticaret REST API sorunsuz çalışıyor!',
    timestamp: new Date().toISOString()
  });
});

export default router;
