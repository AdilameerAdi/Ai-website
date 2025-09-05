import { useState, useEffect } from "react"
import Navbar from "./navbar"
import Hero from "./frontend/hero"
import Problem from "./frontend/problem"
import Solution from "./frontend/solution"
import Features from "./frontend/features"
import HowItWorks from "./frontend/Howitwork"
import Highlights from "./frontend/Highlights"
import Pricing from "./frontend/pricing"
import Roadmap from "./frontend/roadmap"
import FAQs from "./frontend/faqs"
import ContactDemo from "./frontend/contact"
import FeedbackForm from "./frontend/feedback"
import Footer from "./frontend/Footer"
import AuthModal from "./login/Auth"
import UserDashboard from "./dashboard/UserDashboard"

export default function App(){
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    // Check if we have a stored user
    const storedUser = localStorage.getItem('conseccomms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('conseccomms_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('conseccomms_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Show dashboard if user is authenticated
  if (isAuthenticated && user) {
    return <UserDashboard user={user} onLogout={handleLogout} />;
  }

  // Show landing page if not authenticated
  return<>
<Navbar setIsAuthModalOpen={setIsAuthModalOpen}></Navbar>
<Hero setIsAuthModalOpen={setIsAuthModalOpen}></Hero>
<Problem></Problem>
<Solution></Solution>
<Features></Features>
<HowItWorks/>
<Highlights></Highlights>
<Pricing></Pricing>
<Roadmap></Roadmap>
<FAQs></FAQs>
<ContactDemo></ContactDemo>
<FeedbackForm/>
<Footer></Footer>
<AuthModal 
  isOpen={isAuthModalOpen} 
  onClose={() => setIsAuthModalOpen(false)}
  onLoginSuccess={handleLoginSuccess}
/>
  </>
}