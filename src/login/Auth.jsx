import { useState } from "react";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true); // toggle between login & signup
  const [name, setName] = useState(""); // new name field
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // handle login logic
      alert(`Logging in with ${email}`);
    } else {
      // handle signup logic
      alert(`Signing up with Name: ${name}, Email: ${email}`);
    }
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
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
        </button>

        <h2 className="text-2xl font-bold text-blue-900 text-center">
          {isLogin ? "Login to ConsecComms" : "Sign Up for ConsecComms"}
        </h2>
        <p className="text-center text-gray-500 mt-2">
          {isLogin
            ? "Enter your credentials to access your dashboard"
            : "Create your account to start using ConsecDesk, Drive & Quote"}
        </p>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Name field only for signup */}
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#46bfe2] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#46bfe2] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#46bfe2] focus:outline-none"
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-[#46bfe2] hover:underline"
              >
                Forgot Password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl font-semibold bg-[#46bfe2] text-white hover:bg-blue-600 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>

          {/* Google OAuth placeholder */}
          <button
            type="button"
            className="w-full py-2 px-4 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition flex items-center justify-center gap-2 mt-2"
          >
            <img
              src="https://img.icons8.com/color/16/google-logo.png"
              alt="Google"
            />
            Continue with Google
          </button>
        </form>

        {/* Toggle Login/Sign Up */}
        <p className="mt-6 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#46bfe2] font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

        {/* Roadmap apps info for new signup */}
        {!isLogin && (
          <div className="mt-4 text-gray-500 text-sm text-center">
            After signup, you'll get basic access to ConsecDesk, ConsecDrive, ConsecQuote.<br />
            Roadmap apps appear as "Coming Soon" with "Notify Me".
          </div>
        )}
      </div>
    </div>
  );
}
