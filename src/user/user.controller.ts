import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Req, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { StripeService } from '../stripe/stripe.service.js';
import Stripe from 'stripe';

type StripeWebhookRequest = Request & { rawBody?: Buffer | string };

@Controller('user')
export class UserController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  constructor(
    private readonly userService: UserService,
    private readonly stripeService: StripeService
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Post(':id/checkout')
  async initiateEditPayment(@Param('id') userId:string, @Body() updatedFields: Partial<CreateUserDto>) {
    const session = await this.stripeService.createCheckoutSession(+userId, 200, 'Edit User Details', updatedFields);
    return { url: session.url };
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: StripeWebhookRequest,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !webhookSecret.startsWith('whsec_')) {
      throw new BadRequestException('Stripe webhook secret is missing or invalid. Set STRIPE_WEBHOOK_SECRET in your .env file.');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body for webhook verification');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error: any) {
      console.error(`⚠️ Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }

    if (event && event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata) {
        return { received: true };
      }

      const { action, userId, payload } = metadata;

      if (action === 'Update User Details' && typeof userId === 'string' && typeof payload === 'string') {
        const updatedFields = JSON.parse(payload);
        const numericUserId = Number(userId);

        console.log('=== WEBHOOK FIRED ===', action, userId, updatedFields);

        if (!Number.isInteger(numericUserId)) {
          throw new BadRequestException('Invalid user id in Stripe checkout metadata');
        }

        await this.userService.update(numericUserId, updatedFields);
        return { message: 'User details updated successfully.' };
      }
    }
    return { received: true };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
