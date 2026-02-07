import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  items: string[];
}

const Card: React.FC<CardProps> = ({ title, description, items }) => {
  // Split items into two columns
  const midPoint = Math.ceil(items.length / 2);
  const column1 = items.slice(0, midPoint);
  const column2 = items.slice(midPoint);

  return (
    <div className="flex flex-col w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
      {/* Title */}
      <h3 
        className="font-[Beiruti] text-right mb-4 sm:mb-4 px-2"
        style={{ 
          color: 'var(--primary)', 
          fontSize: '1.25rem', 
          fontWeight: 400,
          lineHeight: '1.2'
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p 
          className="font-[Beiruti] text-right mb-4 sm:mb-6 px-2"
          style={{ 
            color: 'var(--black60)', 
            fontSize: '1', 
            fontWeight: 400,
            lineHeight: '1.5'
          }}
        >
          {description}
        </p>
      )}

      {/* Two-column list */}
      <div className="flex gap-6 sm:gap-8 w-full">
        {/* Column 1 */}
        <div className="flex-1">
          <ul className="space-y-2">
            {column1.map((item, index) => (
              <li 
                key={index} 
                className="flex items-center gap-2 text-right"
              >
                <span className="text-emerald-500 flex-shrink-0 text-xs">●</span>
                <span 
                  className="font-[Beiruti]"
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 400,
                    color: 'var(--black87)',
                    lineHeight: '1.4'
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2 */}
        <div className="flex-1">
          <ul className="space-y-2">
            {column2.map((item, index) => (
              <li 
                key={index} 
                className="flex items-center gap-2 text-right"
              >
                <span className="text-emerald-500 flex-shrink-0 text-xs">●</span>
                <span 
                  className="font-[Beiruti]"
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 400,
                    color: 'var(--black87)',
                    lineHeight: '1.4'
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Card;