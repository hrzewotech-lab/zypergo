import React from 'react';

export default function FAQPage() {
  return (
    <div className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div className="p-6 border border-slate-200 rounded-xl">
            <h3 className="font-bold text-lg mb-2">How long does delivery take?</h3>
            <p className="text-slate-600">Intracity deliveries are usually completed within hours, while intercity may take 1-3 days.</p>
          </div>
          {/* Add more FAQs */}
        </div>
      </div>
    </div>
  );
}
