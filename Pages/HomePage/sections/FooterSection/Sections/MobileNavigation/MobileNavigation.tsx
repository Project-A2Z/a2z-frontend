import React from 'react';
import { ShoppingCart, Search, MessageCircle, Heart, Bell } from 'lucide-react';

const MobileNavigation = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* Top curved line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      
      {/* Navigation items */}
      <div className="flex justify-around items-center px-4 py-3">
        {/* Shopping Cart */}
        <div className="flex flex-col items-center">
          <ShoppingCart className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1 font-beiruti">السلة</span>
        </div>

        {/* Search */}
        <div className="flex flex-col items-center">
          <Search className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1 font-beiruti">بحث</span>
        </div>

        {/* Chat Bubble - Highlighted */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            {/* Purple glow effect */}
            <div className="absolute inset-0 w-14 h-14 bg-purple-400 rounded-full blur-md opacity-30 -z-10" />
          </div>
        </div>

        {/* Favorites */}
        <div className="flex flex-col items-center">
          <Heart className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1 font-beiruti">المفضلة</span>
        </div>

        {/* Notifications */}
        <div className="flex flex-col items-center relative">
          <Bell className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1 font-beiruti">إشعارات</span>
          {/* Notification dot */}
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;