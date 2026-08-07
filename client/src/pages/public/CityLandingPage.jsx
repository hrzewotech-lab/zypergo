import React from 'react';
import { useParams } from 'react-router-dom';

export default function CityLandingPage() {
  const { slug } = useParams();
  
  return (
    <div className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 capitalize">Logistics Services in {slug}</h1>
        <p className="text-lg text-slate-600">Reliable delivery services tailored for {slug}.</p>
      </div>
    </div>
  );
}
