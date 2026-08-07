import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppCTA() {
  const phoneNumber = "1234567890"; // Placeholder, can be updated later
  const message = encodeURIComponent("Hello ZyperGo, I have an enquiry.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#1ebe5d] transition-all duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 ease-in-out font-medium">
        Chat with us
      </span>
    </a>
  );
}
