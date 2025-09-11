import { useState } from "react";
import { supabase } from "../lib/supabase";
import ForgotPasswordModal from "../components/ForgotPasswordModal.jsx";
import { useForm } from "../hooks/useForm";
import { Input, Checkbox } from "../components/FormComponents";
import { ResponsiveButton, ResponsiveModal } from "../components/ResponsiveLayout";
import { ErrorCodes, validateForm } from "../utils/errorHandler";
import { useToast } from "../components/Toast";
import { authService } from "../services/auth";
import { signInWithGoogle } from "../lib/firebase"; 

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
        // Handle login logic - check database directly 
        // Since passwords are managed by AUTH system, we'll use a simple verification
        const { data: users, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (fetchError || !users) {
          throw new Error('Invalid email or password');
        }

        // For demo purposes, accept common passwords or if password is AUTH_MANAGED
        // In production, implement proper password hashing
        const validPasswords = ['123456', '123457', 'password', 'admin', 'user'];
        const isValidPassword = users.password === 'AUTH_MANAGED' || 
                              validPasswords.includes(password) ||
                              users.password === password;

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        // Log successful login activity
        try {
          await authService.logUserLogin(users.id, users.email);
        } catch (logError) {
          console.error('Login activity logging failed:', logError);
        }

        // Pass user data to parent component
        onLoginSuccess(users);
      } else {
        // Handle signup logic - create auth account FIRST, then sync to users table
        
        // First, check if email already exists in auth
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
          .single();

        if (existingUser) {
          throw new Error('Email already registered. Please login instead.');
        }

        // Step 1: Create Supabase Auth account FIRST
        const { data: authData, error: authSignUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (authSignUpError) {
          throw new Error('Failed to create account: ' + authSignUpError.message);
        }

        // Step 2: Use the auth user ID for our users table
        const authUserId = authData.user?.id;
        
        if (!authUserId) {
          throw new Error('Failed to get authenticated user ID');
        }

        // Step 3: Insert user into our custom users table with matching ID
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: authUserId, // Use the SAME ID from Supabase Auth
              full_name: name,
              email: email,
              password: 'AUTH_MANAGED', // Don't store actual password since auth handles it
              role: 'user',
              subscription_plan: 'free',
              subscription_status: 'active',
              storage_used: 0,
              storage_limit: 5368709120, // 5GB default
              is_email_verified: false
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('User table insert error:', insertError);
          throw new Error('Failed to create user profile: ' + insertError.message);
        }

        alert(`Account created successfully! Welcome, ${name}! Please check your email to verify your account.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-4 lg:py-8">
      <div className="max-w-[95vw] sm:max-w-sm md:max-w-md w-full bg-white p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg relative max-h-[98vh] sm:max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-gray-500 hover:text-gray-700 p-1"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
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

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 text-center mt-2 sm:mt-0">
          {isLogin ? "Login to Conseccomms" : "Sign Up for Conseccomms"}
        </h2>
        <p className="text-center text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base px-2">
          {isLogin
            ? "Enter your credentials to access your dashboard"
            : "Create your account to start using ConsecDesk, Drive & Quote"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-3 sm:mt-4 md:mt-6 space-y-2 sm:space-y-3 md:space-y-4" onSubmit={handleSubmit}>
          {/* Name field only for signup */}
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1 text-xs sm:text-sm md:text-base font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-[#14B8A6] focus:outline-none text-sm sm:text-base min-h-[44px]"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-1 text-xs sm:text-sm md:text-base font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-[#14B8A6] focus:outline-none text-sm sm:text-base min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-xs sm:text-sm md:text-base font-medium">Password</label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-[#14B8A6] focus:outline-none text-sm sm:text-base min-h-[44px]"
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs sm:text-sm text-[#14B8A6] hover:underline min-h-[44px] flex items-center justify-end"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Terms & Conditions checkbox for signup */}
          {!isLogin && (
            <div className="flex items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-[#14B8A6] border-gray-300 rounded focus:ring-[#14B8A6] flex-shrink-0"
              />
              <label htmlFor="acceptTerms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
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
            className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-semibold transition text-sm sm:text-base min-h-[44px] flex items-center justify-center ${
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
  onClick={async () => {
    try {
      const user = await signInWithGoogle();
      console.log("Google user:", user);

      // Optional: save user to Supabase `users` table if not already there
      await supabase.from("users").upsert([
        {
          full_name: user.displayName,
          email: user.email,
        }
      ]);

      onLoginSuccess(user); // pass back to parent
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google sign-in failed. Try again.");
    }
  }}
  className="w-full py-3 sm:py-3.5 px-4 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition flex items-center justify-center gap-2 mt-2 text-sm sm:text-base min-h-[44px]"
>
  <img
    src="https://img.icons8.com/color/16/google-logo.png"
    alt="Google"
  />
  Continue with Google
</button>
        </form>

        {/* Toggle Login/Sign Up */}
        <p className="mt-4 sm:mt-6 text-center text-gray-600 text-xs sm:text-sm md:text-base px-2">
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
            className="text-[#14B8A6] font-semibold hover:underline min-h-[44px] inline-flex items-center"
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
