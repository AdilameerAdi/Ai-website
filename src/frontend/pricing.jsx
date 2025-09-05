import { useState } from "react";

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("Start Free");

  const plans = [
    {
      name: "Start Free",
      price: "₹0",
      users: "1 User",
      features: [
        "Basic access to Desk, Drive (5GB), Quote (3 proposals/month)",
        "Limited AI replies & tagging",
        "Community support",
      ],
      cta: "Get Started",
    },
    {
      name: "Growth",
      price: "₹499/mo",
      users: "Up to 5 Users",
      features: [
        "25GB ConsecDrive storage",
        "Unlimited proposals",
        "AI auto-tagging & smart replies",
        "Proposal suggestions via AI",
        "Email notifications",
        "Standard support",
      ],
      cta: "Get Started",
    },
    {
      name: "Business",
      price: "₹1,999/mo",
      users: "Up to 15 Users",
      features: [
        "50GB ConsecDrive storage",
        "Full ConsecIQ AI suite (Desk, Drive, Quote)",
        "Multi-user dashboards & collaboration",
        "Proposal approval workflows",
        "Advanced reporting",
        "Priority support",
      ],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: "₹4,999/mo",
      users: "Up to 25 Users",
      features: [
        "100GB ConsecDrive storage",
        "Advanced AI (customized tagging & templates)",
        "Team collaboration with permissions",
        "Admin analytics dashboards",
        "Premium support",
      ],
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      price: "Custom",
      users: "25+ Users",
      features: [
        "Flexible users & storage",
        "Dedicated ConsecIQ AI tuning",
        "ERP/CRM integrations",
        "Enterprise-grade analytics",
        "Dedicated success manager",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section className="relative bg-white py-20" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Pricing Plans
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that fits your business — scale as you grow.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan, index) => (
            <div
              key={index}
              onClick={() => setSelectedPlan(plan.name)}
              className={`p-6 rounded-2xl border-3 shadow-md transition cursor-pointer 
                ${
                  selectedPlan === plan.name
                    ? "border-[#14B8A6]"
                    : "border-gray-200 hover:shadow-lg"
                }
              `}
            >
              {/* Title */}
              <h3 className="text-xl font-semibold text-[#14B8A6]">{plan.name}</h3>
              <p className="mt-1 text-gray-600">{plan.users}</p>

              {/* Price */}
              <p className="mt-4 text-3xl font-bold text-gray-800">{plan.price}</p>

              {/* Features as simple list with dots */}
              <ul className="mt-6 list-disc list-inside text-gray-600 text-sm space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`mt-8 w-full py-2 px-4 rounded-lg font-semibold transition ${
                  selectedPlan === plan.name
                    ? "bg-[#14B8A6] text-white hover:bg-[#0d9488]"
                    : "bg-teal-100 text-[#14B8A6] hover:bg-teal-200"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
