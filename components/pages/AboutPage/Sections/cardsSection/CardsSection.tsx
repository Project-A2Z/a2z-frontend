import React from "react";
import Card from "../cardsSection/card";
import productsData from "../ProductsSection/productsData.json";

const CardSection: React.FC = () => {
  const tabs = productsData?.tabs ?? [];
  const firstTabCards = tabs[0]?.cards ?? [];
  const otherTabs = tabs.slice(1);

  return (
    <section className="w-full bg-white py-4 sm:py-8 lg:py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {firstTabCards.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              description={card.description}
              items={card.items}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherTabs.map((tab, index) => (
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
