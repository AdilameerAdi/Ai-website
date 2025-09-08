import { FaRobot, FaFolderOpen, FaFileInvoice } from "react-icons/fa";

export default function Highlights() {
  const highlights = [
    {
      title: "Desk AI",
      text: "Smart replies, summaries, and follow-up suggestions.",
      icon: <FaRobot className="h-10 w-10 text-[#1C94B5]" />,
    },
    {
      title: "Drive AI",
      text: "Auto-tagging, metadata extraction, and semantic search.",
      icon: <FaFolderOpen className="h-10 w-10 text-[#1C94B5]" />,
    },
    {
      title: "Quote AI",
      text: "Templates, line items, and pricing suggestions.",
      icon: <FaFileInvoice className="h-10 w-10 text-[#1C94B5]" />,
    },
  ];

  return (
    <section
      id="ai"
      className="relative bg-gradient-to-r from-[#E6F7FB] via-[#F0FAFC] to-[#E6F7FB] py-20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C94B5]">
            ConsecIQ Highlights
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            AI is at the core of Conseccomms — powering productivity across Desk,
            Drive, and Quote.
          </p>
        </div>

        {/* Highlights Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow-md border border-[#1C94B5]/20 bg-white hover:shadow-lg transition text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1C94B5]/10 mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#1C94B5]">
                {item.title}
              </h3>
              <p className="mt-3 text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
