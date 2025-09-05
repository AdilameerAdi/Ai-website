import { FaThLarge, FaMoneyBillWave, FaBrain } from "react-icons/fa";  

export default function Problem() {
   const problems = [
    {
      title: "Too Many Tools",
      text: "SMEs juggle too many disconnected SaaS tools.",
      icon: <FaThLarge className="h-10 w-10 text-[#14B8A6]" />, // Indigo = multiple apps/tools
    },
    {
      title: "Rising Costs",
      text: "Rising subscription costs reduce efficiency.",
      icon: <FaMoneyBillWave className="h-10 w-10 text-green-600" />, // Green = money/finance
    },
    {
      title: "Lack of AI Support",
      text: "Teams lack AI support to work smarter.",
      icon: <FaBrain className="h-10 w-10 text-purple-600" />, // Purple = AI/innovation
    },
  ];

  return (
    <section className="relative bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            The Problems SMEs Face
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Modern businesses are stuck with inefficiencies from scattered tools,
            rising costs, and lack of intelligent support.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow-md border border-gray-100 bg-white hover:shadow-lg transition text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mx-auto mb-4">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#14B8A6]">
                {problem.title}
              </h3>
              <p className="mt-3 text-gray-600">{problem.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
