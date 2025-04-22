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
                onError={(e) => {
                  // Replace with fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <span className="mr-2 text-xs font-bold">{sport.name.substring(0, 2)}</span>
          )}
          {sport.display_name}
        </Link>
      ))}
    </div>
  )
} 