import React from 'react';
import Navbar from '../../components/public/Navbar';
import { Shield, Lock, Eye } from 'lucide-react';
import useSEO from '../../hooks/useSEO';

export default function PrivacyPolicyPage() {
  useSEO({
    title: 'Privacy Policy',
    description: 'Read the ZyperGo Privacy Policy to learn how we collect, use, and protect your personal information.',
    keywords: 'privacy policy, data protection, security'
  });

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
              <Shield size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-slate-600">Last updated: August 2026</p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed">
              
              <p>This Privacy Policy explains how ZyperGo ("we", "us", or "our") collects, uses, and protects your information when you use our logistics and delivery platform.</p>
              
              <div className="flex items-start gap-4 my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 text-blue-600"><Eye size={24}/></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg m-0 mb-1">Information Collection</h3>
                  <p className="text-slate-600 m-0 text-base">We collect information when you book a parcel, register as a partner, or contact support. This includes your name, contact details, and precise location data during active deliveries.</p>
                </div>
              </div>

              <h2>How We Use Your Data</h2>
              <p>We use the information we collect primarily to provide, maintain, protect, and improve our current services and to develop new ones. This includes tracking shipments in real-time, facilitating payments, and ensuring the safety of our riders and customers.</p>
              
              <div className="flex items-start gap-4 my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 text-teal-600"><Lock size={24}/></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg m-0 mb-1">Data Security</h3>
                  <p className="text-slate-600 m-0 text-base">We implement industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.</p>
                </div>
              </div>

              <h2>Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting our support team directly.</p>

              <h2>Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@zypergo.com" className="text-blue-600 font-semibold no-underline hover:underline">privacy@zypergo.com</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
