import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions.guard';

// ---------------------------------------------------------------
// AUTH MODULE
//
// Registers Passport with the default 'jwt' strategy, and provides
// the strategy + guards so they can be injected anywhere in the app.
//
// Import this module in AppModule. Then use the guards in controllers:
//
//   @UseGuards(JwtAuthGuard, PermissionsGuard)
//   @Permissions('read:tasks')
//   findAll() { ... }
// ---------------------------------------------------------------

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, PermissionsGuard],
  exports: [JwtAuthGuard, PermissionsGuard],
})
export class AuthModule {}
