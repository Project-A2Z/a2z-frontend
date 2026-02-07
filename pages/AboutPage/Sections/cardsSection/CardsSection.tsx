import React from 'react';
import Card from '../cardsSection/card';
import productsData from '../ProductsSection/productsData.json';

const CardSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-4 sm:py-8 lg:py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Chemical Category Cards Grid - 3 columns on large screens, 2 on medium, 1 on small */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {productsData.tabs[0].cards?.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              description={card.description}
              items={card.items}
            />
          ))}
        </div>

        {/* Bottom Three Sections - supplies, consulting, cosmetics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsData.tabs.slice(1).map((tab, index) => (
            <Card
              key={index}
              title={tab.title}
              description={tab.subtitle}
              items={tab.items}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardSection;