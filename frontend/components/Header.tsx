import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-700 flex items-center">
          <span className="mr-2">👗</span>
          Fashion Search
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">
                How It Works
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
