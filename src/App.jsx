import React, { useState } from 'react';
import CameraTab from './components/CameraTab';
import DietTab from './components/DietTab';
import CommunityTab from './components/CommunityTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('camera');

  const renderTab = () => {
    switch (activeTab) {
      case 'camera':
        return <CameraTab />;
      case 'diet':
        return <DietTab />;
      case 'community':
        return <CommunityTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <h1 className="text-xl font-bold text-center">칼로리 트래커</h1>
        </header>

        {/* Main Content */}
        <main className="p-4">{renderTab()}</main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
          <div className="flex justify-around">
            {['camera', 'diet', 'community', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn flex-1 flex flex-col items-center py-2 ${activeTab === tab ? 'text-blue-500' : 'text-gray-500'
                  }`}
              >
                <span className="text-xs capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
