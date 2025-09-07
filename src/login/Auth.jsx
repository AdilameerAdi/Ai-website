import { useState } from "react";
import { supabase } from "../lib/supabase";
import ForgotPasswordModal from "../components/ForgotPasswordModal.jsx";
import { useForm } from "../hooks/useForm";
import { Input, Checkbox } from "../components/FormComponents";
import { ResponsiveButton, ResponsiveModal } from "../components/ResponsiveLayout";
import { ErrorCodes, validateForm } from "../utils/errorHandler";
import { useToast } from "../components/Toast";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Login form validation rules
  const loginRules = {
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: 6
    }
  };

  // Signup form validation rules
  const signupRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    },
    acceptTerms: {
      required: true,
      validate: (value) => value === true || 'You must accept the terms and conditions'
    }
  };

  const validationRules = isLogin ? loginRules : signupRules;
  const initialValues = isLogin 
    ? { email: '', password: '' }
    : { name: '', email: '', password: '', acceptTerms: false };

  const {
    values,
    errors: formErrors,
    isSubmitting,
    handleChange,
    handleSubmit: handleFormSubmit,
    setFormValues,
    reset
  } = useForm(initialValues, validationRules);

  const { email = '', password = '', name = '', acceptTerms = false } = values || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Handle login logic - fetch user from database
        const { data: users, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (fetchError || !users) {
          throw new Error('Invalid email or password');
        }

        // Simple password verification (in production, use proper hashing!)
        // For now, we'll use Supabase Auth for secure password handling
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
          // If auth fails, check our custom table
          const { data: userCheck, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password) // Note: In production, NEVER store plain passwords!
            .single();

          if (checkError || !userCheck) {
            throw new Error('Invalid email or password');
          }

          // Pass user data to parent component
          onLoginSuccess(userCheck);
        } else {
          // Pass user data to parent component
          onLoginSuccess(users);
        }
      } else {
        // Handle signup logic - save to database
        
        // First, check if email already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
          .single();

        if (existingUser) {
          throw new Error('Email already registered. Please login instead.');
        }

        // Insert new user into our custom users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              full_name: name,
              email: email,
              password: password // Note: In production, hash this password!
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // Also create auth account for secure authentication
        try {
          await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                full_name: name,
              }
            }
          });
        } catch (authError) {
          console.log('Auth signup error (non-critical):', authError);
        }

        alert(`Account created successfully! Welcome, ${name}!`);
        onClose(); // Close modal after successful signup
      }
    } catch (error) {
      setError(error.message);
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
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

        <h2 className="text-2xl font-bold text-gray-800 text-center">
          {isLogin ? "Login to Conseccomms" : "Sign Up for Conseccomms"}
        </h2>
        <p className="text-center text-gray-500 mt-2">
          {isLogin
            ? "Enter your credentials to access your dashboard"
            : "Create your account to start using ConsecDesk, Drive & Quote"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Name field only for signup */}
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#46bfe2] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#46bfe2] focus:outline-none"
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#14B8A6] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Terms & Conditions checkbox for signup */}
          {!isLogin && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                className="mt-1 w-4 h-4 text-[#14B8A6] border-gray-300 rounded focus:ring-[#14B8A6]"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                I agree to the{" "}
                <a
                  href="#/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#14B8A6] hover:underline cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="#/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#14B8A6] hover:underline cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={(!isLogin && !acceptTerms) || isLoading}
            className={`w-full py-2 px-4 rounded-xl font-semibold transition ${
              (!isLogin && !acceptTerms) || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#14B8A6] text-white hover:bg-[#0d9488]"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isLogin ? "Logging in..." : "Creating Account..."}
              </div>
            ) : (
              isLogin ? "Login" : "Sign Up"
            )}
          </button>

          {/* Google OAuth placeholder */}
          <button
            type="button"
            onClick={() => alert('Google OAuth integration coming soon!')}
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
            onClick={() => {
              const newMode = !isLogin;
              setIsLogin(newMode);
              // Reset form with appropriate initial values
              const newInitialValues = newMode 
                ? { email: '', password: '' }
                : { name: '', email: '', password: '', acceptTerms: false };
              reset(newInitialValues);
              setError(""); // Clear any error messages
            }}
            className="text-[#14B8A6] font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

        {/* Roadmap apps info for new signup */}
        {!isLogin && (
          <div className="text-gray-500 text-sm text-center">
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          // Auth modal is already open, so just switch back to login view
        }}
      />
    </div>
  );
}
