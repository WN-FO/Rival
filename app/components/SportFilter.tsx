'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Sport {
  id: number
  name: string
  display_name: string
  icon_url: string | null
  active: boolean
}

interface SportFilterProps {
  sports: Sport[]
  activeSportId: string | null
}

// Generate a dynamic SVG icon for sports
const generateSportIcon = (sportName: string, isActive: boolean = false): string => {
  const bgColors: Record<string, string> = {
    'NBA': '#006BB6',
    'NFL': '#013369',
    'MLB': '#002D72',
    'NHL': '#000000',
    'NCAAF': '#7B0000',
    'NCAAB': '#003399'
  };
  
  const bgColor = isActive 
    ? (bgColors[sportName] || '#4f46e5') 
    : '#e5e7eb';
  const textColor = isActive ? 'white' : '#4b5563';
  const initials = sportName.substring(0, 2).toUpperCase();
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${bgColor.replace('#', '%23')}" /><text x="50" y="50" font-family="Arial" font-size="35" fill="${textColor.replace('#', '%23')}" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initials}</text></svg>`;
};

export default function SportFilter({ sports, activeSportId }: SportFilterProps) {
  const router = useRouter();
  // Filter out inactive sports
  const activeSports = sports.filter(sport => sport.active)

  // Handle sport selection with client-side routing
  const handleSportSelect = (sportId: number | null) => {
    if (sportId) {
      router.push(`/?sport=${sportId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative">
      <div className="flex overflow-x-auto hide-scrollbar py-1 gap-2">
        <button
          onClick={() => handleSportSelect(null)}
          className={`flex flex-col items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            !activeSportId
              ? 'bg-indigo-600 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
          <span>All</span>
        </button>
        
        {activeSports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => handleSportSelect(sport.id)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSportId === sport.id.toString()
                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sport.icon_url ? (
              <div className="w-6 h-6 mb-1 relative">
                <Image
                  src={sport.icon_url}
                  alt={sport.name}
                  width={24}
                  height={24}
                  className="object-contain"
                  unoptimized={true}
                  onError={(e) => {
                    // Use dynamic SVG as fallback
                    e.currentTarget.src = generateSportIcon(
                      sport.name, 
                      activeSportId === sport.id.toString()
                    );
                  }}
                />
              </div>
            ) : (
              <div 
                className="w-6 h-6 mb-1 relative rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("${generateSportIcon(
                    sport.name, 
                    activeSportId === sport.id.toString()
                  )}")`
                }}
              />
            )}
            <span>{sport.name}</span>
          </button>
        ))}
      </div>
      
      {/* Gradient shadows to indicate scrolling */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
    </div>
  )
} 