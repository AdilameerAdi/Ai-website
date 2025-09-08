import { useState } from "react";
import DemoModal from "../components/DemoModal.jsx";
import { ResponsiveButton } from '../components/ResponsiveLayout';

export default function Hero({ setIsAuthModalOpen }) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <section
      id="home"
      className="relative bg-[#1C94B5] pt-20 sm:pt-24 lg:pt-18 pb-12 sm:pb-16 lg:pb-20"
    >
      <div className="responsive-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
              Inspiring Brilliance, <br />
              <span className="text-black">Streaming to Digital Horizons</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
              An AI-driven digital ecosystem for SMEs, powered by{" "}
              <span className="font-semibold text-[#1C94B5]">ConsecIQ</span>. Manage client
              interactions, secure file storage, and proposals — all in one
              intelligent platform.
            </p>

            {/* Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <ResponsiveButton 
                onClick={() => setIsDemoModalOpen(true)}
                size="large"
                className="shadow-md bg-lightgreen hover:bg-[#187a97] text-white"
              >
                Request Demo
              </ResponsiveButton>
              <ResponsiveButton 
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline"
                size="large"
               className="bg-lightgreen hover:bg-[#187a97] text-white"

              >
                Login
              </ResponsiveButton>
            </div>
          </div>

          {/* Right Image / Illustration */}
          <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
           
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
