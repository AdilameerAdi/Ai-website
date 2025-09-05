import { FaUserPlus, FaThLarge, FaArrowUp, FaRocket } from "react-icons/fa";

export default function HowItWorks() {
  const steps = [
    {
      step: "Step 1",
      title: "Sign Up & Log In",
      text: "Create your account and access the platform instantly.",
      icon: <FaUserPlus className="h-10 w-10 text-[#14B8A6]" />,
    },
    {
      step: "Step 2",
      title: "Access Core Apps",
      text: "Use ConsecDesk, ConsecDrive, and ConsecQuote in their basic versions.",
      icon: <FaThLarge className="h-10 w-10 text-green-600" />,
    },
    {
      step: "Step 3",
      title: "Upgrade for More",
      text: "Unlock advanced storage, AI power, and team collaboration with premium plans.",
      icon: <FaArrowUp className="h-10 w-10 text-[#14B8A6]" />,
    },
    {
      step: "Step 4",
      title: "Explore Roadmap Apps",
      text: "Discover upcoming features and join waitlists with Notify Me.",
      icon: <FaRocket className="h-10 w-10 text-purple-600" />,
    },
  ];

  return (
    <section id="how-it-works" className="relative bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get started with Conseccomms in just four simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow-md border border-gray-100 bg-gray-50 hover:shadow-lg transition text-center"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mx-auto mb-4">
                {item.icon}
              </div>
              {/* Step Number */}
              <p className="text-sm font-medium text-[#14B8A6]">{item.step}</p>
              {/* Title */}
              <h3 className="mt-2 text-xl font-semibold text-[#14B8A6]">
                {item.title}
              </h3>
              {/* Description */}
              <p className="mt-3 text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
