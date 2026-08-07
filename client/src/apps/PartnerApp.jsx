import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PartnerDashboard from './partner/PartnerDashboard';

export default function PartnerApp() {
  return (
    <Routes>
      <Route path="/" element={<PartnerDashboard />} />
      <Route path="*" element={<PartnerDashboard />} />
    </Routes>
  );
}
