import React from 'react';

export default function ProhibitedItemsPage() {
  return (
    <div className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto prose prose-slate">
        <h1 className="text-4xl font-bold mb-8">Prohibited Items Policy</h1>
        <p>For safety and legal compliance, ZyperGo cannot transport the following items.</p>
        <ul>
          <li>Hazardous materials</li>
          <li>Illegal substances</li>
          <li>Live animals</li>
          <li>Perishable goods without prior arrangement</li>
        </ul>
      </div>
    </div>
  );
}
