"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-dark">Account Settings</h1>
        <p className="text-gray-500">Manage your account preferences and notification settings.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <p className="font-bold">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive alerts when your listing is approved or rejected.</p>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? "bg-brand-green" : "bg-gray-300"}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? "right-1" : "left-1"}`}></div>
          </button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-bold text-red-600">Delete Account</p>
            <p className="text-sm text-gray-500">Permanently remove your account and all listings.</p>
          </div>
          <button className="text-sm font-black uppercase text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors">
            Request Deletion
          </button>
        </div>
      </div>
    </div>
  );
}
