import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    }

    async createCheckoutSession(userId: number, priceInCents: number = 200, productname: string, updatedFields: Partial<any> = {}) {
        const session = await this.stripe.checkout.sessions.create({
            allowed_payment_method_types: ["card"],
            line_items: [{
                    price_data: {
                        currency: "usd",
                        product_data: { name: productname },
                        unit_amount: priceInCents,
                    },
                    quantity: 1,
            }],
            mode: 'payment',
            metadata: { 
                action: 'Update User Details',
                userId: userId.toString(),
                payload: JSON.stringify(updatedFields)
            },
            success_url: `${process.env.FRONTEND_URL}/users/${userId}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/users/${userId}/edit?payment=cancelled`,
        });

        return session;
    }
}