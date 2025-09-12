import { useState } from "react";
import DemoModal from "../components/DemoModal.jsx";
import { ResponsiveButton } from "../components/ResponsiveLayout";

export default function Hero({ setIsAuthModalOpen }) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <section
      id="home"
      className="relative bg-[#E7F1F7] pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 lg:pb-28"
    >
      <div className="responsive-container">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
            Inspiring Brilliance,
            <br />
            <span className="text-[#187a97]">
              Streaming to Digital Horizons
            </span>
          </h1>

          {/* Sub Text */}
          <p className="mt-6 sm:mt-8 text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Welcome to{" "}
            <span className="font-semibold text-[#187a97]">ConsecIQ</span> — an
            AI-driven digital ecosystem for SMEs.  
            Simplify client interactions, secure your data, and manage proposals
            — all in one smart platform designed to accelerate your digital
            journey.
          </p>

          {/* Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <ResponsiveButton
              onClick={() => setIsAuthModalOpen(true)}
              variant="solid"
              size="large"
              className="bg-[#187a97] hover:bg-[#136a7d] text-white shadow-lg rounded-xl px-7 py-3 font-semibold transition-all"
            >
              Login
            </ResponsiveButton>

            <ResponsiveButton
              onClick={() => setIsDemoModalOpen(true)}
              variant="outline"
              size="large"
              className="border border-[#187a97] text-[#187a97] hover:bg-[#187A97] hover:text-white rounded-xl px-7 py-3 font-semibold transition-all"
            >
              Request Demo
            </ResponsiveButton>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </section>
  );
}
