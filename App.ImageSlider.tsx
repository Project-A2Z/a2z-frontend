import React from 'react';
import ImageSlider from './components/UI/ImageSlider';
import { mockSliderData } from './components/UI/ImageSlider/mockData';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-beiruti">
            معرض الصور التفاعلي
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-beiruti">
            عرض تفاعلي لخدمات صيانة السيارات مع إمكانية التنقل التلقائي والتحكم اليدوي
          </p>
        </div>

        {/* Main Image Slider */}
        <div className="max-w-6xl mx-auto mb-12">
          <ImageSlider
            slides={mockSliderData}
            autoPlay={true}
            autoPlayInterval={4000}
            showDots={true}
            showArrows={true}
            className="shadow-2xl"
          />
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 font-beiruti">
            مميزات العارض
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 font-beiruti">متجاوب</h3>
              <p className="text-gray-600 text-sm font-beiruti">
                يعمل بشكل مثالي على جميع الأجهزة والشاشات
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 font-beiruti">تلقائي</h3>
              <p className="text-gray-600 text-sm font-beiruti">
                تنقل تلقائي بين الصور مع إمكانية الإيقاف المؤقت
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 font-beiruti">تفاعلي</h3>
              <p className="text-gray-600 text-sm font-beiruti">
                أزرار تنقل ونقاط مؤشرة للتحكم السهل
              </p>
            </div>
          </div>
        </div>

        {/* Additional Slider Examples */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 font-beiruti">
            أمثلة أخرى
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Compact Slider */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700 font-beiruti">
                عارض مدمج
              </h3>
              <ImageSlider
                slides={mockSliderData.slice(0, 2)}
                autoPlay={false}
                showDots={true}
                showArrows={true}
                className="h-64"
              />
            </div>

            {/* Auto-play Disabled */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700 font-beiruti">
                تحكم يدوي فقط
              </h3>
              <ImageSlider
                slides={mockSliderData.slice(1, 3)}
                autoPlay={false}
                showDots={true}
                showArrows={true}
                className="h-64"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;