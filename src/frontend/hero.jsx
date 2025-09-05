export default function Hero({ setIsAuthModalOpen }) {
  return (
    <section id="home" className="relative bg-gradient-to-r from-white via-sky-50 to-blue-100 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight">
            Inspiring Brilliance, <br />
            <span className="text-blue-600">Streaming to Digital Horizons</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
            An AI-driven digital ecosystem for SMEs, powered by{" "}
            <span className="font-semibold text-blue-700">ConsecIQ</span>. Manage client
            interactions, secure file storage, and proposals — all in one
            intelligent platform.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition">
              Request Demo
            </button>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Right Image / Illustration */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <img
            src="../img/hero-illustration.png"
            alt="AI Digital Ecosystem"
            className="w-full max-w-md lg:max-w-lg drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
