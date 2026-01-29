import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { users, payments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-04-10",
});

// Webhook endpoint
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("[Stripe] Webhook secret not configured");
      return res.json({ received: true });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error("[Stripe] Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const db = await getDb();
    if (!db) {
      console.warn("[Stripe] Database not available");
      return res.json({ received: true });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || "0");

        if (userId) {
          await db
            .update(users)
            .set({
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            })
            .where(eq(users.id, userId));
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (userResult.length > 0) {
          const user = userResult[0];
          await db.insert(payments).values({
            userId: user.id,
            amount: invoice.amount_paid || 0,
            currency: invoice.currency?.toUpperCase() || "USD",
            stripePaymentIntentId: invoice.payment_intent as string,
            status: "succeeded",
            description: `Invoice ${invoice.number}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (userResult.length > 0) {
          await db
            .update(users)
            .set({ stripeSubscriptionId: null })
            .where(eq(users.id, userResult[0].id));
        }
        break;
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("[Stripe] Webhook error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
