// logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    console.log(`[Interceptor] --> ${method} ${url}`);

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - now;
        console.log(
          `[Interceptor] <-- ${method} ${url} ${duration}ms`,
        );
        console.log(`[Interceptor] Response:`, responseData);
      }),
    );
  }
}