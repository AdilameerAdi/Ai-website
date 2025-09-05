import { useState } from "react";
import { Video, Mail, Users, CreditCard, MessageSquare, Link2 } from "lucide-react";

export default function Roadmap() {
  const upcomingApps = [
    { name: "ConsecMeet", desc: "AI-powered video meetings with transcripts.", icon: Video },
    { name: "ConsecMail", desc: "Smart inbox with AI-prioritized email.", icon: Mail },
    { name: "ConsecTalent", desc: "AI-driven hiring & candidate matching.", icon: Users },
    { name: "ConsecPay", desc: "UPI/payments with AI fraud detection.", icon: CreditCard },
    { name: "ConsecLoop", desc: "WhatsApp automation & chatbots.", icon: MessageSquare },
    { name: "ConsecLink", desc: "AI-powered freelancer marketplace.", icon: Link2 },
  ];

  const [notified, setNotified] = useState(null);

  const handleNotify = (appName) => {
    setNotified(appName);
    setTimeout(() => setNotified(null), 2000); // reset after 2 sec
  };

  return (
    <section className="bg-gradient-to-b from-teal-50 to-white py-20" id="roadmap">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            🚀 Future Roadmap (Coming Soon)
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Beyond Desk, Drive, and Quote — explore what’s next with ConsecIQ.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingApps.map((app, index) => {
            const Icon = app.icon;
            return (
              <div
                key={index}
                className={`p-8 rounded-2xl border shadow-md transition transform hover:-translate-y-1 hover:shadow-lg bg-white text-center
                  ${notified === app.name ? "border-[#14B8A6] ring-2 ring-[#14B8A6]" : "border-gray-200"}
                `}
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="p-4 rounded-2xl bg-teal-100 text-[#14B8A6]">
                    <Icon size={36} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-4 text-xl font-semibold text-[#14B8A6]">{app.name}</h3>

                {/* Description */}
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{app.desc}</p>

                {/* Button */}
                <button
                  onClick={() => handleNotify(app.name)}
                  className={`mt-6 w-full py-2 px-4 rounded-xl font-semibold transition shadow
                    ${
                      notified === app.name
                        ? "bg-green-600 text-white"
                        : "bg-[#14B8A6] text-white hover:bg-[#0d9488]"
                    }
                  `}
                >
                  {notified === app.name ? "✔ Added" : "Notify Me"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
