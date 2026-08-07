import React from 'react';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import HomeBanner from '../components/public/HomeBanner';
import StatsSection from '../components/public/StatsSection';
import Features3D from '../components/public/Features3D';
import VehicleScrollTrack from '../components/public/VehicleScrollTrack';
import useSEO from '../hooks/useSEO';

export default function LandingPage() {
  useSEO({
    title: 'Enterprise Logistics & Delivery',
    description: 'Fast, secure, and affordable logistics for your business and personal needs. Book intracity and intercity deliveries instantly.',
    keywords: 'logistics, delivery, courier, intercity, intracity, b2b delivery'
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      <Navbar />

      <main className="flex-grow flex flex-col">
        <HomeBanner />
        <StatsSection />
        <Features3D />
        <VehicleScrollTrack />
      </main>

      <Footer />
    </div>
  );
}
