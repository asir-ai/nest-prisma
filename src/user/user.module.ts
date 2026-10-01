import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { StripeService } from '../stripe/stripe.service.js';

@Module({
  controllers: [UserController],
  providers: [UserService, StripeService],
})
export class UserModule {}
