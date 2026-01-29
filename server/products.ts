/**
 * Stripe products and pricing configuration
 * These should be created in Stripe dashboard and referenced here
 */

export const STRIPE_PRODUCTS = {
  PERSONAL_PLAN: {
    name: "Personal Plan",
    description: "Unlimited projects, download code, priority support",
    priceInCents: 2900, // $29.00
    interval: "month" as const,
    stripePriceId: process.env.STRIPE_PERSONAL_PRICE_ID || "price_personal_placeholder",
  },
  TEAM_PLAN: {
    name: "Team Plan",
    description: "Team collaboration, advanced analytics, dedicated support",
    priceInCents: 9900, // $99.00
    interval: "month" as const,
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID || "price_team_placeholder",
  },
};

export const SUBSCRIPTION_PLANS_CONFIG = {
  FREE: {
    id: "free",
    name: "Free",
    pricePerMonth: 0,
    projectsPerMonth: 3,
    canDownload: false,
    features: [
      "3 projects per month",
      "View descriptions",
      "Live preview",
      "No code download",
    ],
  },
  PERSONAL: {
    id: "personal",
    name: "Personal",
    pricePerMonth: 2900, // in cents
    projectsPerMonth: -1, // unlimited
    canDownload: true,
    features: [
      "Unlimited projects",
      "Download code",
      "All export formats",
      "Priority support",
      "Advanced editor",
    ],
  },
  TEAM: {
    id: "team",
    name: "Team",
    pricePerMonth: 9900, // in cents
    projectsPerMonth: -1, // unlimited
    canDownload: true,
    features: [
      "Everything in Personal",
      "Team collaboration",
      "Advanced analytics",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
  },
};
