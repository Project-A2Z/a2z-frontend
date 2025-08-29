import React from 'react';
import { ShoppingCart, Search, MessageCircle, Heart, Bell } from 'lucide-react';

const MobileNavigation = () => {
  return (

    // <div className="relative w-full overflow-hidden bg-red-600">
    //         <div className="absolute -top-6 left-0 right-0 h-6 bg-white z-[1]"></div>
    //           <svg viewBox="0 0 1440 120" className="relative w-full h-14 sm:h-20 text-white z-[2] transform rotate-180" preserveAspectRatio="none">
    //           <path d="M0,40 C240,100 480,100 720,60 C960,20 1200,20 1440,60 L1440,120 L0,120 Z" fill="currentColor" />
    //         </svg>
    //   </div>

    <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999] pb-[env(safe-area-inset-bottom)] pointer-events-auto ">
      {/* Navigation items */}
      <div className="flex justify-around items-center px-4 py-4">
        {/* Shopping Cart */}
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
          </div>
          <span className="text-xs text-gray-500 mt-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>السلة</span>
        </div>

        {/* Search */}
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
          </div>
          <span className="text-xs text-gray-500 mt-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>بحث</span>
        </div>

        {/* Chat Bubble - Highlighted */}
        <div className="flex flex-col items-center -mt-12">
          <div className="relative">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <Heart className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
          </div>
          <span className="text-xs text-gray-500 mt-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>المفضلة</span>
        </div>

        {/* Notifications */}
        <div className="flex flex-col items-center relative">
          <div className="w-6 h-6 flex items-center justify-center relative">
            <Bell className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <span className="text-xs text-gray-500 mt-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>إشعارات</span>
        </div>
      </div>
    </div>
    
  );
};

export default MobileNavigation;

