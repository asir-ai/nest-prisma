import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StripeModule } from './stripe/stripe.module.js';

@Module({
  imports: [UserModule, PrismaModule, StripeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
