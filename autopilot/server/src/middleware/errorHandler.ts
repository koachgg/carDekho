import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ERROR] ${statusCode} — ${message}`, err.details || '');

  res.status(statusCode).json({
    error: {
      message,
      stack: err.stack,
      details: err.details
    },
  });
}

export function createError(message: string, statusCode: number, details?: unknown): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}
