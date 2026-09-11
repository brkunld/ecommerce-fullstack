import { type AnyZodObject, ZodError } from 'zod';
import { type Request, type Response, type NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          status: 'fail',
          message: 'Validasyon hatası',
          errors
        });
        return;
      }

      next(error);
    }
  };
};
