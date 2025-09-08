import { useState } from "react";
import { Video, Mail, Users, CreditCard, MessageSquare, Link2, Calendar, Sparkles } from "lucide-react";
import RoadmapNotifyModal from "../components/RoadmapNotifyModal.jsx";

export default function Roadmap() {
  const upcomingApps = [
    {
      name: "ConsecMeet",
      desc: "AI-powered video meetings with transcripts, action items, and smart scheduling.",
      icon: Video,
      timeline: "Q2 2024",
      features: ["AI Transcription", "Smart Scheduling", "Action Item Tracking"]
    },
    {
      name: "ConsecMail",
      desc: "Smart inbox with AI-prioritized email, automated responses, and sentiment analysis.",
      icon: Mail,
      timeline: "Q3 2024",
      features: ["Smart Prioritization", "Auto-Response", "Email Analytics"]
    },
    {
      name: "ConsecTalent",
      desc: "AI-driven hiring & candidate matching with skill assessment and interview scheduling.",
      icon: Users,
      timeline: "Q4 2024",
      features: ["AI Matching", "Skill Assessment", "Interview Automation"]
    },
    {
      name: "ConsecPay",
      desc: "UPI/payments with AI fraud detection, expense tracking, and financial insights.",
      icon: CreditCard,
      timeline: "Q1 2025",
      features: ["Fraud Detection", "Expense Tracking", "Financial Insights"]
    },
    {
      name: "ConsecLoop",
      desc: "WhatsApp automation & chatbots with AI-powered customer support integration.",
      icon: MessageSquare,
      timeline: "Q2 2025",
      features: ["WhatsApp Automation", "AI Chatbots", "Multi-channel Support"]
    },
    {
      name: "ConsecLink",
      desc: "AI-powered freelancer marketplace with skill matching and project management.",
      icon: Link2,
      timeline: "Q3 2025",
      features: ["Skill Matching", "Project Management", "Quality Assurance"]
    },
  ];

  const [notified, setNotified] = useState(new Set());
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const handleNotify = (app) => {
    setSelectedApp(app);
    setIsNotifyModalOpen(true);
  };

  const handleNotifySuccess = () => {
    if (selectedApp) {
      setNotified(prev => new Set([...prev, selectedApp.name]));
    }
  };

  return (
    <section className="bg-[#1C94B5] py-20" id="roadmap">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            🚀 Future Roadmap (Coming Soon)
          </h2>
          <p className="mt-4 text-xl font-bold text-black">
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
                  ${notified.has(app.name) ? "border-[#1C94B5] ring-2 ring-[#1C94B5]" : "border-[#1C94B5]/20"}
                `}
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="p-4 rounded-2xl bg-[#1C94B5]/10 text-[#1C94B5]">
                    <Icon size={36} />
                  </div>
                </div>

                {/* Title & Timeline */}
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-[#1C94B5]">{app.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">{app.timeline}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{app.desc}</p>

                {/* Features */}
                <div className="mt-4 space-y-1">
                  {app.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-1">
                      <Sparkles size={12} className="text-[#1C94B5]" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  onClick={() => handleNotify(app)}
                  disabled={notified.has(app.name)}
                  className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold transition shadow
                    ${
                      notified.has(app.name)
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-[#1C94B5] text-white hover:bg-[#187a97]"
                    }
                  `}
                >
                  {notified.has(app.name) ? "✔ You're Subscribed!" : "🔔 Notify Me"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roadmap Notification Modal */}
      <RoadmapNotifyModal 
        isOpen={isNotifyModalOpen} 
        onClose={() => {
          setIsNotifyModalOpen(false);
          setSelectedApp(null);
        }} 
        onSuccess={handleNotifySuccess}
        appName={selectedApp?.name}
        appTimeline={selectedApp?.timeline}
      />
    </section>
  );
}
