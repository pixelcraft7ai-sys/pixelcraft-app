import Stripe from "stripe";
import { getDb } from "./db";
import { users, userSubscriptions, subscriptionPlans, invoices } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected:", event.type);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Webhook] Checkout session completed:", session.id);

        if (!session.client_reference_id || !session.metadata?.user_id) {
          console.error("[Webhook] Missing user_id in session metadata");
          return;
        }

        const userId = parseInt(session.metadata.user_id);
        const stripeCustomerId = session.customer as string;

        // Update or create user's Stripe customer ID
        await db
          .update(users)
          .set({
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        // Get the subscription ID from the session
        if (session.subscription) {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Determine which plan was purchased
          let planId: number;
          const priceId = subscription.items.data[0]?.price.id;

          // Get the plan from database based on price
          const plans = await db.select().from(subscriptionPlans);
          const matchedPlan = plans.find(p => {
            if (p.name === "Personal" && priceId?.includes("personal")) return true;
            if (p.name === "Team" && priceId?.includes("team")) return true;
            return false;
          });

          planId = matchedPlan?.id || plans[1]?.id; // Default to Personal if not found

          // Create or update subscription
          const existingSubscription = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId));

          const periodStart = (subscription as any).current_period_start;
          const periodEnd = (subscription as any).current_period_end;

          if (existingSubscription.length > 0) {
            await db
              .update(userSubscriptions)
              .set({
                planId,
                stripeSubscriptionId: subscriptionId,
                status: "active",
                currentPeriodStart: new Date(periodStart * 1000),
                currentPeriodEnd: new Date(periodEnd * 1000),
                updatedAt: new Date(),
              })
              .where(eq(userSubscriptions.userId, userId));
          } else {
            await db.insert(userSubscriptions).values({
              userId,
              planId,
              status: "active",
              stripeSubscriptionId: subscriptionId,
              currentPeriodStart: new Date(periodStart * 1000),
              currentPeriodEnd: new Date(periodEnd * 1000),
            });
          }
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Webhook] Invoice paid:", invoice.id);

        const invoiceSubscription = (invoice as any).subscription;
        if (invoiceSubscription) {
          const subscription = await stripe.subscriptions.retrieve(invoiceSubscription);

          const customerId = subscription.customer as string;
          const stripeCustomer = await stripe.customers.retrieve(customerId);
          const email = (stripeCustomer as any).email;

          // Find user by email
          const dbUsers = await db.select().from(users).where(eq(users.email, email));
          if (dbUsers.length === 0) {
            console.error("[Webhook] User not found for email:", email);
            return;
          }

          const userId = dbUsers[0].id;

          // Store invoice record
          const userSubs = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId));

          if (userSubs.length > 0) {
            const hostedUrl = (invoice as any).hosted_invoice_url;
            await db.insert(invoices).values({
              userId,
              subscriptionId: userSubs[0].id,
              stripeInvoiceId: invoice.id,
              amount: invoice.total || 0,
              status: "paid",
              pdfUrl: hostedUrl || undefined,
              issuedAt: new Date((invoice.created as any) * 1000),
              paidAt: new Date(),
            });
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription deleted:", subscription.id);

        // Find and update subscription status
        const subs = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

        if (subs.length > 0) {
          await db
            .update(userSubscriptions)
            .set({
              status: "canceled",
              updatedAt: new Date(),
            })
            .where(eq(userSubscriptions.id, subs[0].id));
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription updated:", subscription.id);

        // Update subscription details
        const subs = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));

        if (subs.length > 0) {
          const periodStart = (subscription as any).current_period_start;
          const periodEnd = (subscription as any).current_period_end;

          await db
            .update(userSubscriptions)
            .set({
              currentPeriodStart: new Date(periodStart * 1000),
              currentPeriodEnd: new Date(periodEnd * 1000),
              updatedAt: new Date(),
            })
            .where(eq(userSubscriptions.id, subs[0].id));
        }

        break;
      }

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    throw error;
  }
}
