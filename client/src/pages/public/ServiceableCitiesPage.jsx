import React from 'react';
import { Link } from 'react-router-dom';

export default function ServiceableCitiesPage() {
  return (
    <div className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Serviceable Cities</h1>
        <p className="text-lg text-slate-600 mb-8">We are currently operating in the following locations:</p>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <li><Link to="/city/mumbai" className="text-blue-600 hover:underline">Mumbai</Link></li>
          <li><Link to="/city/pune" className="text-blue-600 hover:underline">Pune</Link></li>
          {/* Add more cities */}
        </ul>
      </div>
    </div>
  );
}
