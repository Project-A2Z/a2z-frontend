import React from 'react';
import ClientsData from './Clients.json';

interface Client {
  id: number;
  name: string;
  description: string;
  icon: string;
}

const ClientsSection: React.FC = () => {
  const clients: Client[] = ClientsData;

  return (
    <section className="py-16 px-4 bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl font-bold text-center mb-12 text-green-700">
          العملاء
        </h2>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600 group-hover:bg-green-100 transition-colors duration-300">
                <img
                  src={`/companies/${client.icon}`}
                  alt={client.name}
                  className="w-12 h-12 object-contain"
                />
              </div>

              {/* Company Name */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {client.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {client.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;