import { type Request, type Response, type NextFunction } from 'express';
import type { ZodType } from 'zod';

export const validate_user = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req.body);
            if (!result.success) {
                const errors = result.error.issues.map((issue) => {
                    return {
                        camp: issue.path.join('.'),
                        message: issue.message,
                    }
                });
                return res.status(400).json({
                    ok: false,
                    message: 'Validation error',
                    error: errors 
                });
            }
            req.body = result.data;
            next();
        }
    }