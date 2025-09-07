// Application Configuration
export const config = {
  // API Configuration
  google: {
    apiKey: 'AIzaSyBVmgR1uub4sq4SIIHEqoXGMxu1VppTioI'
  },
  
  // Supabase Configuration
  supabase: {
    url: 'https://ygxooauhmbinzrixjahm.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneG9vYXVobWJpbnpyaXhqYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzI1MzgsImV4cCI6MjA3MjY0ODUzOH0.amqD56boN2UR1w2hs8QcGYSd-o7oLSuUaN0EliCMQ7w'
  },

  // App Configuration
  apps: {
    desk: {
      name: 'ConsecDesk',
      icon: 'FaBriefcase',
      description: 'Client Management & Support',
      route: '/desk',
      features: ['Dashboard', 'Tickets', 'Notifications', 'Feedback']
    },
    drive: {
      name: 'ConsecDrive', 
      icon: 'FaFolder',
      description: 'Cloud Storage & Files',
      route: '/drive',
      features: ['Upload', 'Organize', 'Search', 'AI Tagging']
    },
    quote: {
      name: 'ConsecQuote',
      icon: 'FaFileAlt', 
      description: 'Proposals & Quotes',
      route: '/quote',
      features: ['Create', 'Track', 'Export', 'Analytics']
    }
  },

  // Coming Soon Apps (Roadmap)
  roadmapApps: [
    { name: 'ConsecMeet', description: 'AI-powered video meetings', icon: 'FaVideo' },
    { name: 'ConsecChat', description: 'Team communication', icon: 'FaComments' },
    { name: 'ConsecTime', description: 'Time tracking & billing', icon: 'FaClock' },
    { name: 'ConsecCRM', description: 'Customer relationship management', icon: 'FaUsers' }
  ],

  // User Roles
  roles: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },

  // Storage Tiers
  storageTiers: {
    basic: { limit: '5GB', price: 0 },
    pro: { limit: '100GB', price: 9.99 },
    business: { limit: '500GB', price: 29.99 },
    enterprise: { limit: 'Unlimited', price: 99.99 }
  },

  // Theme Colors
  colors: {
    primary: '#14B8A6',
    primaryHover: '#0d9488', 
    secondary: '#1E96B7',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  }
};