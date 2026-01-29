import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { getDb } from "./db";
import { payments, subscriptionPlans, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-04-10",
});

export const stripeRouter = router({
  // Create checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get plan details
        const plan = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, input.planId))
          .limit(1);

        if (!plan.length) throw new Error("Plan not found");

        const planData = plan[0];

        // Get or create Stripe customer
        let stripeCustomerId = ctx.user.stripeCustomerId;
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email,
            name: ctx.user.name,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });
          stripeCustomerId = customer.id;

          // Save customer ID
          await db
            .update(users)
            .set({ stripeCustomerId })
            .where(eq(users.id, ctx.user.id));
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price: planData.stripePriceId || "price_dummy",
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: {
            userId: ctx.user.id.toString(),
            planId: input.planId.toString(),
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("[Stripe] Checkout session creation failed:", error);
        throw error;
      }
    }),

  // Get payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.userId, ctx.user.id));

      return userPayments;
    } catch (error) {
      console.error("[Stripe] Get payment history failed:", error);
      throw error;
    }
  }),

  // Get subscription status
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user.length) throw new Error("User not found");

      const userData = user[0];

      if (!userData.stripeSubscriptionId) {
        return {
          status: "inactive",
          plan: "free",
          message: "No active subscription",
        };
      }

      const subscription = await stripe.subscriptions.retrieve(
        userData.stripeSubscriptionId
      );

      return {
        status: subscription.status,
        plan: subscription.metadata?.plan || "unknown",
        currentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error("[Stripe] Get subscription status failed:", error);
      throw error;
    }
  }),

  // Cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user.length || !user[0].stripeSubscriptionId) {
        throw new Error("No active subscription");
      }

      await stripe.subscriptions.update(user[0].stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return { success: true };
    } catch (error) {
      console.error("[Stripe] Cancel subscription failed:", error);
      throw error;
    }
  }),

  // List available plans
  listPlans: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const plans = await db.select().from(subscriptionPlans);
      return plans;
    } catch (error) {
      console.error("[Stripe] List plans failed:", error);
      throw error;
    }
  }),
});

export type StripeRouter = typeof stripeRouter;
