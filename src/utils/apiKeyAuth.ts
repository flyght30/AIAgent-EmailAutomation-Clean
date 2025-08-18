import { Request, Response, NextFunction } from 'express';
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = process.env.API_KEY;
  if (!key) return next();
  const provided = req.header('x-api-key') || (req.header('authorization')?.replace('Bearer ', ''));
  if (provided !== key) return res.status(401).json({ error: 'unauthorized' });
  next();
}