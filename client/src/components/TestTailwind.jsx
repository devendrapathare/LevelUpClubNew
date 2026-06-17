import React from 'react';

const TestTailwind = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
      <p className="text-lg text-gray-700 mb-6">If you can see this styled text, Tailwind CSS is working correctly!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="font-bold text-red-800">Red Card</h2>
          <p className="text-red-600">This is a red card</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="font-bold text-green-800">Green Card</h2>
          <p className="text-green-600">This is a green card</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="font-bold text-blue-800">Blue Card</h2>
          <p className="text-blue-600">This is a blue card</p>
        </div>
      </div>
      
      <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
        Purple Button
      </button>
    </div>
  );
};

export default TestTailwind;