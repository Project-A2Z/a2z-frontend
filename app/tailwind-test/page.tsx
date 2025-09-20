'use client';

import React from 'react';

const TailwindTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary-600 mb-8">
          Tailwind CSS Test - A2Z Project
        </h1>

        {/* Color Palette Test */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">A2Z Brand Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-gray-500">#88BE46</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-gray-500">#4C9343</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-gray-500">#06B590</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-gray-500">#4C9343</p>
            </div>
          </div>
        </section>

        {/* Button Test */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Button Components</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-accent">Accent Button</button>
            <button className="btn btn-outline">Outline Button</button>
            <button className="btn btn-ghost">Ghost Button</button>
          </div>
        </section>

        {/* Utility Classes Test */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Utility Classes</h2>
          <div className="space-y-4">
            <div className="p-4 bg-primary-100 rounded-lg">
              <p className="text-primary-800">Primary background with text</p>
            </div>
            <div className="p-4 bg-secondary-100 rounded-lg">
              <p className="text-secondary-800">Secondary background with text</p>
            </div>
            <div className="p-4 bg-accent-100 rounded-lg">
              <p className="text-accent-800">Accent background with text</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg">
              <p className="text-white font-semibold">Gradient background</p>
            </div>
          </div>
        </section>

        {/* Responsive Design Test */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Responsive Design</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-primary-200 rounded-lg text-center">
              <p className="text-primary-800">Mobile First</p>
            </div>
            <div className="p-4 bg-secondary-200 rounded-lg text-center">
              <p className="text-secondary-800">Tablet</p>
            </div>
            <div className="p-4 bg-accent-200 rounded-lg text-center">
              <p className="text-accent-800">Desktop</p>
            </div>
          </div>
        </section>

        {/* Custom Components Test */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Custom Components</h2>
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-2">Card Component</h3>
              <p className="text-gray-600">This is a custom card component with A2Z styling.</p>
            </div>
            <input 
              type="text" 
              placeholder="Input field with A2Z styling" 
              className="input-field"
            />
            <div className="text-gradient text-2xl font-bold">
              Gradient Text Effect
            </div>
          </div>
        </section>

        {/* Status */}
        <div className="text-center p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✅ Tailwind CSS is working correctly!
          </p>
          <p className="text-green-600 text-sm mt-1">
            All A2Z brand colors and components are properly configured.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTestPage;
