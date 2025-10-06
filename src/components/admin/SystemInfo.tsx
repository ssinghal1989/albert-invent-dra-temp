import React from 'react';
import { Info, Database, Cloud, Settings } from 'lucide-react';

export function SystemInfo() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <Info className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900">System Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Database</span>
          </div>
          <p className="text-sm text-gray-600">AWS DynamoDB</p>
          <p className="text-xs text-green-600 mt-1">Connected</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Cloud className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">API</span>
          </div>
          <p className="text-sm text-gray-600">AWS AppSync</p>
          <p className="text-xs text-green-600 mt-1">Active</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Environment</span>
          </div>
          <p className="text-sm text-gray-600">Production</p>
          <p className="text-xs text-blue-600 mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}