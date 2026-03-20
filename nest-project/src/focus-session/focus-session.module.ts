import { Module } from '@nestjs/common';
import { FocusSessionService } from './focus-session.service';
import { FocusSessionController } from './focus-session.controller';

@Module({
  providers: [FocusSessionService],
  controllers: [FocusSessionController]
})
export class FocusSessionModule {}
