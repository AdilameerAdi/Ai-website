import { FaTachometerAlt, FaTicketAlt, FaRobot, FaCloudUploadAlt, FaFolderOpen, FaSearch, FaFileAlt, FaEdit, FaCheckCircle } from "react-icons/fa";
import { ResponsiveGrid, ResponsiveCard } from '../components/ResponsiveLayout';

export default function Features() {
  const features = [
    {
      title: "ConsecDesk",
      description: "Dashboard • Tickets • AI auto-replies & summaries.",
      icon: <FaTachometerAlt className="h-10 w-10 text-[#14B8A6]" />,
      bullets: [
        { text: "Client Dashboard", icon: <FaTachometerAlt className="text-[#14B8A6]" /> },
        { text: "Ticket Management", icon: <FaTicketAlt className="text-[#14B8A6]" /> },
        { text: "AI Auto-Replies & Summaries", icon: <FaRobot className="text-[#14B8A6]" /> },
      ],
    },
    {
      title: "ConsecDrive",
      description: "Upload/Download • Folders • AI tagging & semantic search.",
      icon: <FaCloudUploadAlt className="h-10 w-10 text-green-600" />,
      bullets: [
        { text: "Secure Upload & Download", icon: <FaCloudUploadAlt className="text-green-500" /> },
        { text: "Organized Folders", icon: <FaFolderOpen className="text-green-500" /> },
        { text: "AI Tagging & Smart Search", icon: <FaSearch className="text-green-500" /> },
      ],
    },
    {
      title: "ConsecQuote",
      description: "Create/Edit/PDF • Track status • AI suggestions & pricing.",
      icon: <FaFileAlt className="h-10 w-10 text-[#14B8A6]" />,
      bullets: [
        { text: "Create, Edit & Export PDF", icon: <FaEdit className="text-[#14B8A6]" /> },
        { text: "Track Proposal Status", icon: <FaCheckCircle className="text-[#14B8A6]" /> },
        { text: "AI Suggestions & Pricing", icon: <FaRobot className="text-[#14B8A6]" /> },
      ],
    },
  ];

  return (
    <section id="features" className="relative bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="responsive-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              Powerful Features for SMEs
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">
              Conseccomms simplifies operations with AI-driven apps that cover
              client management, secure storage, and smart proposals.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="gap-6 sm:gap-8 lg:gap-10">
              {features.map((feature, index) => (
                <ResponsiveCard
                  key={index}
                  padding="large"
                  hover={true}
                  className="text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-teal-50 mx-auto mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-3xl">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#14B8A6]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">{feature.description}</p>

                  {/* Bullet Points */}
                  <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-left">
                    {feature.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                        <div className="flex-shrink-0">
                          {bullet.icon}
                        </div>
                        <span>{bullet.text}</span>
                      </li>
                    ))}
                  </ul>
                </ResponsiveCard>
              ))}
            </ResponsiveGrid>
          </div>
        </div>
      </div>
    </section>
  );
}
