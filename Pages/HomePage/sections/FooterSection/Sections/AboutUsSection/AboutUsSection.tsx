import React from 'react'
const AboutUsSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
            <span className="text-green-400 font-bold text-xl">A2Z</span>
          </div>
          <span className="text-lg font-bold text-white">شركة A2Z</span>
        </div>
        
        <p className="text-gray-200 text-sm leading-relaxed">
          شركة متخصصة في جميع أنواع الكيماويات 
          وتاجرة كيماويات البناء والحدث والخامات 
          البترولية وكيماويات الصيدلة والعطور 
          والمواد المساعدة وكيماويات صناعة 
          المنظفات ومستحضرات التجميل
        </p>
      </div>
    );
  };
export default React.memo(AboutUsSection)