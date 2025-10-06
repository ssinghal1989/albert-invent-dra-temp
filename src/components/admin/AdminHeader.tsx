import React from 'react';
import { Shield } from 'lucide-react';

export function AdminHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-600 text-lg">Manage assessments and system data</p>
    </div>
  );
}