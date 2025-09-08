import { Users, Cloud, FileSignature } from "lucide-react"; // Using lucide-react for consistency

export default function Solution() {
  const solutions = [
    {
      name: "ConsecDesk",
      desc: "AI-powered client dashboard & support.",
      icon: Users,
    },
    {
      name: "ConsecDrive",
      desc: "Secure file storage with AI tagging & smart search.",
      icon: Cloud,
    },
    {
      name: "ConsecQuote",
      desc: "AI-assisted proposals in minutes.",
      icon: FileSignature,
    },
  ];

  return (
    <section className="relative bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            One Platform. Real Simplicity.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Conseccomms brings everything SMEs need into one intelligent,
            AI-powered ecosystem.
          </p>
        </div>

        {/* Solution Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl shadow-md border border-gray-100 bg-white hover:shadow-lg transition text-center"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4">
                  <Icon className="text-[#1C94B5]" size={32} />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-semibold text-[#1C94B5]">
                  {solution.name}
                </h3>
                <p className="mt-3 text-gray-600">{solution.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
