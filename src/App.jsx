import React, { useState } from 'react';
import CameraTab from './components/CameraTab';
import DietTab from './components/DietTab';
import CommunityTab from './components/CommunityTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  // 현재 활성화된 탭 상태
  const [activeTab, setActiveTab] = useState('camera');

  // 탭에 따라 렌더링할 컴포넌트를 선택
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
    // 전체 앱 레이아웃
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden">

        {/* 상단 제목 영역 */}
        <header className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <h1 className="text-xl font-bold text-center">칼로리 트래커</h1>
        </header>

        {/* 선택된 탭 콘텐츠 */}
        <main className="p-4">{renderTab()}</main>

        {/* 하단 네비게이션 바 */}
        <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
          <div className="flex justify-around">
            {/* 탭 버튼 */}
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
