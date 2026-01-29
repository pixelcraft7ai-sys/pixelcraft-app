import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const { data: plans, isLoading } = trpc.stripe.listPlans.useQuery();
  const { mutate: createCheckout, isPending } = trpc.stripe.createCheckoutSession.useMutation();

  const handleSelectPlan = (planId: number) => {
    createCheckout(
      {
        planId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      },
      {
        onSuccess: (data) => {
          if (data.url) {
            window.open(data.url, "_blank");
          }
        },
        onError: (error) => {
          toast.error("Failed to create checkout session");
        },
      }
    );
  };

  if (isLoading) return <div>Loading plans...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Pricing Plans</h1>
        <p className="text-center text-gray-400 mb-12">Choose the perfect plan for your needs</p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans?.map((plan) => (
            <Card key={plan.id} className="p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-500 mb-4">{plan.description}</p>
              
              <div className="text-3xl font-bold mb-6">
                ${(plan.pricePerMonth / 100).toFixed(2)}
                <span className="text-lg text-gray-500">/month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features && JSON.parse(plan.features).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? "Processing..." : "Get Started"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
