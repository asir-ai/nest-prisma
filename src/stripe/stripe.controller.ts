import { Body, Controller, Inject, Post } from "@nestjs/common";
import { StripeService } from "./stripe.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Controller('payment')
export class StripeController {
    constructor(
        private readonly stripeService: StripeService,
        @Inject(PrismaService) private readonly prisma: PrismaService,
    ) {}

    @Post('checkout')
    async checkout(@Body() body: { userId: number; amount: number; productName: string }) {
        const session = await this.stripeService.createCheckoutSession(
            body.userId,
            body.amount,
            body.productName,
        );

        await this.prisma.orm.public.Order.create({
            userId: body.userId,
            stripeSessionId: session.id,
            amount: body.amount,
            status: 'pending',
        });

        return { url: session.url };
    }
}