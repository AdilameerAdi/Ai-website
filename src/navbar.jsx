import { useState } from "react";
import logo from "./img/logo.png";

export default function Navbar({ setIsAuthModalOpen }) {
  const [isOpen, setIsOpen] = useState(false);

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const targetPosition = element.offsetTop - 80; // Account for fixed navbar height
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = Math.abs(distance) > 1000 ? 1200 : 800; // Longer duration for longer distances
      
      let start = null;
      
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const progressRatio = Math.min(progress / duration, 1);
        
        // Easing function for smoother animation (ease-in-out)
        const easeInOutCubic = progressRatio < 0.5
          ? 4 * progressRatio * progressRatio * progressRatio
          : (progressRatio - 1) * (2 * progressRatio - 2) * (2 * progressRatio - 2) + 1;
        
        window.scrollTo(0, startPosition + (distance * easeInOutCubic));
        
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
      // Close mobile menu after clicking
      setIsOpen(false);
    }
  };

  const navLinks = [
    "Home",
    "Features",
    "How It Works",
    "AI",
    "Pricing",
    "Roadmap",
    "FAQs",
    "Contact",
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-md bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 py-2 flex-shrink-0">
            <img
              src={logo}
              alt="Logo"
              className="h-8 sm:h-10 md:h-12 w-auto md:w-36 object-contain"
            />
          </a>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-center">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() =>
                  smoothScrollTo(link.toLowerCase().replace(/\s+/g, "-"))
                }
                className="relative text-gray-800 font-medium text-sm lg:text-base transition-colors hover:text-[#14B8A6] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#14B8A6] after:transition-all hover:after:w-full px-2"
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <button
              onClick={() => smoothScrollTo("contact")}
              className="px-3 lg:px-4 py-2 text-sm lg:text-base rounded-2xl text-white bg-[#14B8A6] hover:opacity-90 transition whitespace-nowrap"
            >
              Request Demo
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 lg:px-4 py-2 text-sm lg:text-base rounded-2xl border border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white transition whitespace-nowrap"
            >
              Login
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-800 p-2 flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>


      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-64px)] overflow-y-auto">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => smoothScrollTo(link.toLowerCase().replace(/\s+/g, "-"))}
                className="relative block text-gray-800 font-medium text-base transition-colors hover:text-[#14B8A6] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-[#14B8A6] after:transition-all hover:after:w-full w-full text-left py-2 px-2 rounded-lg hover:bg-gray-50"
              >
                {link}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => smoothScrollTo("contact")}
                  className="w-full px-4 py-3 text-base rounded-2xl text-white bg-[#14B8A6] hover:opacity-90 transition font-medium">
                  Request Demo
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full px-4 py-3 text-base rounded-2xl border border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white transition font-medium"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
