import { useState } from "react";
import { FaCheck, FaTimes, FaStar, FaCrown } from "react-icons/fa";
import PricingInquiryModal from "../components/PricingInquiryModal.jsx";
import { ResponsiveGrid, ResponsiveCard, ResponsiveButton } from '../components/ResponsiveLayout';

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("Start Free");
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [inquiryPlan, setInquiryPlan] = useState(null);

  const plans = [
    {
      name: "Start Free",
      price: "₹0",
      period: "Forever Free",
      users: "1 User",
      storage: "5 GB",
      popular: false,
      features: [
        "ConsecDesk: Basic ticket support",
        "ConsecDrive: 5GB file storage",
        "ConsecQuote: 3 proposals/month",
        "Limited ConsecIQ AI features",
        "Community support",
        "Basic email notifications",
      ],
      limitations: [
        "No advanced AI insights",
        "No team collaboration",
        "No custom workflows",
      ],
      cta: "Get Started Free",
    },
    {
      name: "Growth",
      price: "₹499",
      period: "/month",
      users: "Up to 5 Users",
      storage: "25 GB",
      popular: true,
      features: [
        "Everything in Free plan",
        "ConsecDrive: 25GB storage",
        "ConsecQuote: Unlimited proposals",
        "AI auto-tagging & smart replies",
        "AI-powered proposal suggestions",
        "Advanced email notifications",
        "Standard support (24/7 chat)",
        "Basic team collaboration",
      ],
      limitations: [
        "Limited admin controls",
        "Basic reporting only",
      ],
      cta: "Start Growth Plan",
    },
    {
      name: "Business",
      price: "₹1,999",
      period: "/month",
      users: "Up to 15 Users",
      storage: "100 GB",
      popular: false,
      features: [
        "Everything in Growth plan",
        "ConsecDrive: 100GB storage",
        "Full ConsecIQ AI suite",
        "Advanced AI sentiment analysis",
        "Multi-user dashboards",
        "Proposal approval workflows",
        "Advanced reporting & analytics",
        "Priority support (phone + chat)",
        "Team permissions & roles",
      ],
      limitations: [
        "No custom AI training",
        "Limited integrations",
      ],
      cta: "Start Business Plan",
    },
    {
      name: "Pro",
      price: "₹4,999",
      period: "/month",
      users: "Up to 50 Users",
      storage: "500 GB",
      popular: false,
      features: [
        "Everything in Business plan",
        "ConsecDrive: 500GB storage",
        "Custom AI model training",
        "Advanced team collaboration",
        "Custom proposal templates",
        "Admin analytics dashboard",
        "API access & integrations",
        "Premium support (dedicated manager)",
        "Custom workflows & automation",
        "White-label options",
      ],
      limitations: [],
      cta: "Start Pro Plan",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "Pricing",
      users: "Unlimited Users",
      storage: "Unlimited",
      popular: false,
      features: [
        "Everything in Pro plan",
        "Unlimited storage & users",
        "Dedicated ConsecIQ AI infrastructure",
        "Custom ERP/CRM integrations",
        "Enterprise-grade security",
        "Advanced compliance features",
        "Dedicated success manager",
        "Custom onboarding & training",
        "24/7 phone support",
        "SLA guarantees",
      ],
      limitations: [],
      cta: "Contact Sales",
    },
  ];

  const handlePricingInquiry = (planName) => {
    setInquiryPlan(planName);
    setIsPricingModalOpen(true);
  };

  return (
    <section className="relative bg-white py-12 sm:py-16 lg:py-20" id="pricing">
      <div className="responsive-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              Pricing Plans
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">
              Choose the plan that fits your business — scale as you grow.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="mt-10 sm:mt-12 lg:mt-16">
            <ResponsiveGrid 
              cols={{ mobile: 1, tablet: 2, desktop: 3 }} 
              gap="gap-6 lg:gap-8"
              className="xl:grid-cols-5"
            >
              {plans.map((plan, index) => (
                <ResponsiveCard
                  key={index}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`transition cursor-pointer border-2 ${
                    selectedPlan === plan.name
                      ? "border-[#14B8A6] ring-2 ring-[#14B8A6] ring-opacity-30"
                      : "border-gray-200 hover:shadow-lg hover:border-[#14B8A6]"
                  }`}
                  hover={false}
                >
                  {/* Title */}
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#14B8A6]">{plan.name}</h3>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">{plan.users}</p>

                    {/* Price */}
                    <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-800">{plan.price}</p>
                    <p className="text-sm text-gray-500">{plan.period}</p>

                    {/* Storage Info */}
                    <p className="mt-2 text-sm text-[#14B8A6] font-medium">{plan.storage} Storage</p>
                  </div>

                  {/* Features as simple list with dots */}
                  <ul className="mt-4 sm:mt-6 list-disc list-inside text-gray-600 text-xs sm:text-sm space-y-1 sm:space-y-2">
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <li key={i} className="text-left">{feature}</li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-[#14B8A6] font-medium text-left">+{plan.features.length - 6} more features</li>
                    )}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6 sm:mt-8">
                    <ResponsiveButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (plan.name === "Start Free") {
                          // Scroll to contact form for free trial signup
                          const contactSection = document.getElementById('contact');
                          if (contactSection) {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          handlePricingInquiry(plan.name);
                        }
                      }}
                      variant={selectedPlan === plan.name ? "primary" : "outline"}
                      size="medium"
                      fullWidth={true}
                    >
                      {plan.cta}
                    </ResponsiveButton>
                  </div>
                </ResponsiveCard>
              ))}
            </ResponsiveGrid>
          </div>
        </div>
      </div>

      {/* Pricing Inquiry Modal */}
      <PricingInquiryModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
        selectedPlan={inquiryPlan}
      />
    </section>
  );
}
