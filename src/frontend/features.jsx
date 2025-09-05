import { FaTachometerAlt, FaTicketAlt, FaRobot, FaCloudUploadAlt, FaFolderOpen, FaSearch, FaFileAlt, FaEdit, FaCheckCircle } from "react-icons/fa";

export default function Features() {
  const features = [
    {
      title: "ConsecDesk",
      description: "Dashboard • Tickets • AI auto-replies & summaries.",
      icon: <FaTachometerAlt className="h-10 w-10 text-indigo-600" />,
      bullets: [
        { text: "Client Dashboard", icon: <FaTachometerAlt className="text-indigo-500" /> },
        { text: "Ticket Management", icon: <FaTicketAlt className="text-indigo-500" /> },
        { text: "AI Auto-Replies & Summaries", icon: <FaRobot className="text-indigo-500" /> },
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
      icon: <FaFileAlt className="h-10 w-10 text-blue-600" />,
      bullets: [
        { text: "Create, Edit & Export PDF", icon: <FaEdit className="text-blue-500" /> },
        { text: "Track Proposal Status", icon: <FaCheckCircle className="text-blue-500" /> },
        { text: "AI Suggestions & Pricing", icon: <FaRobot className="text-blue-500" /> },
      ],
    },
  ];

  return (
    <section id="features" className="relative bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">
            Powerful Features for SMEs
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Conseccomms simplifies operations with AI-driven apps that cover
            client management, secure storage, and smart proposals.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl shadow-md border border-gray-100 bg-white hover:shadow-lg transition text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-blue-800">
                {feature.title}
              </h3>
              <p className="mt-3 text-gray-600">{feature.description}</p>

              {/* Bullet Points */}
              <ul className="mt-6 space-y-3 text-left">
                {feature.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700">
                    {bullet.icon}
                    <span>{bullet.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
