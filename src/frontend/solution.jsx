import { FaUsers, FaCloud, FaFileSignature } from "react-icons/fa"; // Font Awesome icons

export default function Solution() {
  const solutions = [
    {
      title: "ConsecDesk",
      text: "AI-powered client dashboard & support.",
      icon: <FaUsers className="h-10 w-10 text-green-600" />,
    },
    {
      title: "ConsecDrive",
      text: "Secure file storage with AI tagging & smart search.",
      icon: <FaCloud className="h-10 w-10 text-[#14B8A6]" />,
    },
    {
      title: "ConsecQuote",
      text: "AI-assisted proposals in minutes.",
      icon: <FaFileSignature className="h-10 w-10 text-[#14B8A6]" />,
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
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow-md border border-gray-100 bg-white hover:shadow-lg transition text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mx-auto mb-4">
                {solution.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#14B8A6]">
                {solution.title}
              </h3>
              <p className="mt-3 text-gray-600">{solution.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
