import React from 'react';

const TailwindTestComponent: React.FC = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 mt-8">
      <div className="shrink-0">
        <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">T</div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind CSS Test</div>
        <p className="text-slate-500">If you see this styled, Tailwind is working!</p>
        <button className="mt-2 px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm hover:bg-cyan-600">Click Me</button>
      </div>
    </div>
  );
};

export default TailwindTestComponent;
