import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 shadow-lg border-b border-slate-700/50">
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 
                     text-xl font-bold tracking-tight hover:scale-105 transition-transform duration-200"
        >
          Web3 Academy
        </Link>
        <div className="flex space-x-6">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-white relative group py-2"
          >
            <span>Home</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 
                           group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link 
            to="/about" 
            className="text-gray-300 hover:text-white relative group py-2"
          >
            <span>Learning</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 
                           group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;