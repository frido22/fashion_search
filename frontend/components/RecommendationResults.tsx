import React from 'react';
import Image from 'next/image';
import { FiStar, FiExternalLink } from 'react-icons/fi';

type Recommendation = {
  title: string;
  link: string;
  source: string;
  price: string;
  thumbnail: string;
  rating?: number;
  reviews?: number;
  extensions: string[];
};

interface RecommendationResultsProps {
  recommendations: Recommendation[];
}

const RecommendationResults: React.FC<RecommendationResultsProps> = ({ recommendations }) => {
  return (
    <section className="animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6 text-center">Your Fashion Recommendations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            <div className="relative h-64 w-full">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-lg mb-2 line-clamp-2" title={item.title}>
                {item.title}
              </h3>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-primary-700 font-semibold">{item.price}</span>
                
                {item.rating && (
                  <div className="flex items-center text-yellow-500">
                    <FiStar className="fill-current mr-1" />
                    <span>{item.rating}</span>
                    {item.reviews && (
                      <span className="text-gray-500 text-sm ml-1">({item.reviews})</span>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mb-3">
                {item.source}
              </p>
              
              {item.extensions && item.extensions.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {item.extensions.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary w-full flex items-center justify-center"
              >
                View Item <FiExternalLink className="ml-2" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendationResults;
