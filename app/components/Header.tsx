'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { MenuIcon, XIcon, UserIcon, ChevronDownIcon } from './icons'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'My Picks', href: '/picks' },
    { name: 'Leaderboard', href: '/ranks' },
  ]

  const userNavigation = [
    { name: 'Profile', href: user ? `/profile/${user.id}` : '#' },
    { name: 'Settings', href: '/settings' },
    { name: 'Admin', href: '/admin', admin: true },
    { name: 'Sign out', onClick: signOut },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen)

  // Determine if a nav item is active based on pathname
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  // Show admin link only if user has admin role
  const filteredUserNav = userNavigation.filter(item => 
    !item.admin || (profile?.is_admin === true)
  );

  return (
    <header className={`bg-white ${scrolled ? 'shadow-md' : 'shadow-sm'} transition-all duration-200`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="sr-only">Rival Sports</span>
              <div className="h-10 w-auto relative">
                <Image
                  src="/images/Rivalailogo.png"
                  alt="Rival Sports Logo"
                  width={120}
                  height={60}
                  className="h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'><rect width='120' height='60' fill='%234f46e5' /><text x='60' y='30' font-family='Arial' font-size='24' fill='white' text-anchor='middle' dominant-baseline='central' font-weight='bold'>RIVAL</text></svg>";
                  }}
                />
              </div>
            </Link>
            <div className="hidden md:ml-10 md:block">
              <div className="flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-700 hover:text-indigo-500'
                    } px-1 py-5 text-sm font-medium transition-colors`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center">
            {user ? (
              <div className="ml-4 flow-root relative">
                <button
                  type="button"
                  className="group flex items-center"
                  onClick={toggleUserMenu}
                  aria-expanded={userMenuOpen}
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-200 overflow-hidden">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="User avatar"
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <span className="ml-2 hidden md:block text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                  <ChevronDownIcon className="ml-1 h-5 w-5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {filteredUserNav.map((item) => (
                      item.onClick ? (
                        <button
                          key={item.name}
                          onClick={item.onClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-500 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {mobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="space-y-1 px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-500'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={closeMobileMenu}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
} 