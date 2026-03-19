// logger.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[Middleware] ${req.method} ${req.originalUrl}`);

    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[Middleware] Body:`, req.body);
    }

    next();
  }
}