import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminHeader } from './admin/AdminHeader';
import { QuestionManagement } from './admin/QuestionManagement';
import { UserManagement } from './admin/UserManagement';
import { AssessmentManagement } from './admin/AssessmentManagement';
import { SystemInfo } from './admin/SystemInfo';

export function AdminPanel() {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <AdminHeader />
            
            <div className="space-y-8">
              <QuestionManagement />
              <UserManagement />
              <AssessmentManagement />
              <SystemInfo />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}