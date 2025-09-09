import { useState } from "react";
import { adminAuthService } from "../services/adminAuth";

// Import all existing components
import Navbar from "../navbar";
import Hero from "../frontend/hero";
import Problem from "../frontend/problem";
import Solution from "../frontend/solution";
import Features from "../frontend/features";
import HowItWorks from "../frontend/Howitwork";
import Highlights from "../frontend/Highlights";
import Pricing from "../frontend/pricing";
import Roadmap from "../frontend/roadmap";
import FAQs from "../frontend/faqs";
import ContactDemo from "../frontend/contact";

import Footer from "../frontend/Footer";
import AuthModal from "../login/Auth";
import AdminLogin from "../components/AdminLogin";

export default function LandingPage({ onLoginSuccess }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const handleAdminLoginSuccess = (adminUser) => {
    // Import all permissions for admin
    const allPermissions = [
      'view_own_data',
      'edit_own_data',
      'create_proposals',
      'upload_files',
      'submit_tickets',
      'view_all_users',
      'edit_all_users',
      'view_all_proposals',
      'view_all_files',
      'view_all_tickets',
      'manage_leads',
      'view_reports',
      'moderate_feedback',
      'manage_admins',
      'system_config',
      'delete_any_data',
      'view_audit_logs'
    ];
    
    // Create admin user object compatible with auth system
    const adminAuthData = {
      id: adminUser.id,
      full_name: adminUser.admin_name,
      email: `${adminUser.admin_name}@admin.local`,
      role: adminUser.role === 'super_admin' ? 'super_admin' : 'admin',
      isAdmin: true,
      isSuperAdmin: adminUser.role === 'super_admin',
      permissions: allPermissions // Give admin all permissions
    };
    
    console.log('Admin login success, redirecting with data:', adminAuthData);
    onLoginSuccess(adminAuthData);
  };

  return (
    <>
      <Navbar setIsAuthModalOpen={setIsAuthModalOpen} />
      <Hero setIsAuthModalOpen={setIsAuthModalOpen} />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <Highlights />
      <Pricing />
      <Roadmap />
      <FAQs />
      <ContactDemo />
      <Footer />
      
      {/* Admin Login Button - Fixed position */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsAdminLoginOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 text-sm font-medium"
          title="Admin Login"
        >
          🔐 Admin
        </button>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />
      
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />
    </>
  );
}