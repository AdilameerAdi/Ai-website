import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQs() {
  const faqs = [
    {
      q: "Is Conseccomms available publicly?",
      a: "Yes, the website is public and any user can sign up.",
    },
    {
      q: "What happens when I sign up?",
      a: "You get basic access to all three apps (Desk, Drive, Quote). For future apps, you can register interest via Notify Me.",
    },
    {
      q: "What makes Conseccomms different?",
      a: "It’s AI-native, powered by ConsecIQ. Unlike other SaaS, AI is embedded into every workflow.",
    },
    {
      q: "What AI features are included?",
      a: (
        <ul className="list-disc pl-6 space-y-1">
          <li>AI replies & conversation summaries</li>
          <li>Auto file tagging & metadata insights</li>
          <li>Proposal generation & pricing suggestions</li>
        </ul>
      ),
    },
    {
      q: "What does “Coming Soon” mean in the roadmap?",
      a: "Future AI-driven apps (Meet, Mail, Talent, etc.) are under development. You can sign up for updates.",
    },
    {
      q: "How is data secured?",
      a: "Data is encrypted, role-based access enforced, and cloud storage complies with Indian IT & privacy regulations.",
    },
    {
      q: "Is there a free plan?",
      a: "Yes — the Start Free plan supports 1 user with 5GB storage and basic features.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-20" id="faqs">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">FAQs</h2>
          <p className="mt-4 text-lg text-gray-600">
            Answers to common questions about Conseccomms.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-medium text-[#1C94B5] hover:bg-[#E6F4F9]"
              >
                {faq.q}
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 text-base animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
