import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// Existing Pages & Components
import Home from './portal/Home';
import TrackShipment from './portal/TrackShipment';
import RateCalculator from './portal/RateCalculator';
import ContactPage from '../pages/public/ContactPage';
import AboutPage from '../pages/public/AboutPage';
import FeaturesPage from '../pages/public/FeaturesPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import Navbar from '../components/public/Navbar';

// New Pages
import HowItWorksPage from '../pages/public/HowItWorksPage';
import IntracityDeliveryPage from '../pages/public/IntracityDeliveryPage';
import IntercityDeliveryPage from '../pages/public/IntercityDeliveryPage';
import ServiceableCitiesPage from '../pages/public/ServiceableCitiesPage';
import CityLandingPage from '../pages/public/CityLandingPage';
import PartnerEnquiryPage from '../pages/public/PartnerEnquiryPage';
import RiderEnquiryPage from '../pages/public/RiderEnquiryPage';
import BusinessEnquiryPage from '../pages/public/BusinessEnquiryPage';
import FAQPage from '../pages/public/FAQPage';
import BlogListPage from '../pages/public/BlogListPage';
import BlogPostPage from '../pages/public/BlogPostPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsPage from '../pages/public/TermsPage';
import RefundPolicyPage from '../pages/public/RefundPolicyPage';
import ProhibitedItemsPage from '../pages/public/ProhibitedItemsPage';

// Floating CTA
import WhatsAppCTA from '../components/public/WhatsAppCTA';

function PortalLayout({ children }) {
  const location = useLocation();
  const showSearch = location.pathname === '/contact';

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col relative">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full mx-auto">
        {children}
      </main>

      <WhatsAppCTA />

      {/* Footer */}
      <footer className="bg-slate-50 text-slate-600 py-16 mt-auto border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 pr-4">
            <Link to="/" className="inline-block mb-6">
              <img src="/images/logo.png" alt="ZyperGo Logo" className="h-10 opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Industrial reliability meets modern efficiency. Connect with us for all your local and intercity logistics needs.
            </p>
          </div>
          <div>
            <h3 className="text-slate-900 font-black mb-6 text-sm uppercase tracking-widest">Services</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/track" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Track Shipment</Link></li>
              <li><Link to="/calculate" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Rate Calculator</Link></li>
              <li><Link to="/intracity-delivery" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Intracity Delivery</Link></li>
              <li><Link to="/intercity-delivery" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Intercity Delivery</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-900 font-black mb-6 text-sm uppercase tracking-widest">Company</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/about" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>How It Works</Link></li>
              <li><Link to="/cities" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Serviceable Cities</Link></li>
              <li><Link to="/blog" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Blog & Updates</Link></li>
              <li><Link to="/faq" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-900 font-black mb-6 text-sm uppercase tracking-widest">Partner</h3>
            <ul className="space-y-4 text-sm font-medium mb-8">
              <li><Link to="/partner" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Partner With Us</Link></li>
              <li><Link to="/rider" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Become a Rider</Link></li>
              <li><Link to="/business" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Business Enquiry</Link></li>
            </ul>
            <h3 className="text-slate-900 font-black mb-6 text-sm uppercase tracking-widest">Legal</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/terms" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#fb5c00] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} ZyperGo Logistics. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-6">
            <Link to="/refund" className="hover:text-[#fb5c00] transition-colors">Refund Policy</Link>
            <Link to="/prohibited-items" className="hover:text-[#fb5c00] transition-colors">Prohibited Items</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PortalApp() {
  return (
    <PortalLayout>
      <Routes>
        {/* Core Features */}
        <Route path="/" element={<Home />} />

        <Route path="/track" element={<TrackShipment />} />
        <Route path="/track/:id" element={<TrackShipment />} />
        <Route path="/calculate" element={<RateCalculator />} />

        {/* Services & Info */}
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/intracity-delivery" element={<IntracityDeliveryPage />} />
        <Route path="/intercity-delivery" element={<IntercityDeliveryPage />} />
        <Route path="/cities" element={<ServiceableCitiesPage />} />
        <Route path="/city/:slug" element={<CityLandingPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* Company & Enquiries */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/partner" element={<PartnerEnquiryPage />} />
        <Route path="/rider" element={<RiderEnquiryPage />} />
        <Route path="/business" element={<BusinessEnquiryPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Legal */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        <Route path="/prohibited-items" element={<ProhibitedItemsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </PortalLayout>
  );
}



