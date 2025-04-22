import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  const initials = sportName.substring(0, 2).toUpperCase();
  const bgColor = isActive ? '#4f46e5' : '#e5e7eb';
  const textColor = isActive ? 'white' : '#4b5563';
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${bgColor.replace('#', '%23')}" /><text x="50" y="50" font-family="Arial" font-size="35" fill="${textColor.replace('#', '%23')}" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initials}</text></svg>`;
};

export default function SportFilter({ sports, activeSportId }: SportFilterProps) {
  // Filter out inactive sports
  const activeSports = sports.filter(sport => sport.active)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          !activeSportId
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Sports
      </Link>
      
      {activeSports.map((sport) => (
        <Link
          key={sport.id}
          href={`/?sport=${sport.id}`}
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            activeSportId === sport.id.toString()
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {sport.icon_url ? (
            <div className="w-4 h-4 mr-2 relative">
              <Image
                src={sport.icon_url}
                alt={sport.name}
                width={16}
                height={16}
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
              className="w-4 h-4 mr-2 relative rounded-full"
              style={{
                background: `url("${generateSportIcon(
                  sport.name, 
                  activeSportId === sport.id.toString()
                )}") center/cover`
              }}
            />
          )}
          {sport.display_name}
        </Link>
      ))}
    </div>
  )
} 