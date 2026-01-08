import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const baseLink =
  'rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300'

const activeLink = 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-100'

export default function Nav() {
  const { token, coach, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)

  const initials = useMemo(() => {
    if (!coach?.name) return 'GT'
    return coach.name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('')
  }, [coach?.name])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('pointerdown', handleClickOutside as any)
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside as any)
    }
  }, [isMenuOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        setIsMobileOpen(false)
      }
    }

    if (isMobileOpen) {
      document.addEventListener('pointerdown', handleClickOutside as any)
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside as any)
    }
  }, [isMobileOpen])

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || 0
      const delta = y - lastScrollY.current
      const threshold = 8
      if (Math.abs(delta) < threshold) return

      if (!isMenuOpen && !isMobileOpen && y > 80 && delta > 0) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      lastScrollY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    const onContentScroll = (ev: Event) => {
      try {
        const ce = ev as CustomEvent<any>
        const y = Number(ce.detail?.y ?? 0)
        const delta = Number(ce.detail?.delta ?? 0)
        const threshold = 8
        if (Math.abs(delta) < threshold) return
        if (!isMenuOpen && y > 80 && delta > 0) {
          setIsHidden(true)
        } else {
          setIsHidden(false)
        }
        lastScrollY.current = y
      } catch {}
    }
    window.addEventListener('content-scroll', onContentScroll as EventListener)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('content-scroll', onContentScroll as EventListener)
    }
  }, [isMenuOpen, isMobileOpen])

  return (
    <header className={`sticky top-0 z-30 border-b border-slate-200 bg-white/80 shadow-surface backdrop-blur supports-[backdrop-filter]:bg-white/70 transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 py-2 md:gap-4 md:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2 rounded-full bg-white/70 px-2 py-1.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 sm:gap-3 sm:px-3 sm:py-2 sm:text-lg"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-lg text-brand-600 transition group-hover:bg-brand-500/20 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xl">
            🎾
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">Panel</span>
            <span className="text-sm sm:text-lg">Gestión Tenis</span>
          </div>
        </Link>

        <button
          type="button"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen(prev => !prev)}
          className="ml-auto inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 md:hidden"
        >
          <span className="sr-only">Abrir menú</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <nav className="ml-auto hidden items-center gap-2 md:flex">
          {token ? (
            <>
              <NavLink
                to="/students"
                className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}
              >
                Alumnos
              </NavLink>
              <NavLink
                to="/lessons"
                className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}
              >
                Clases
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}
              >
                Configuración
              </NavLink>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  aria-expanded={isMenuOpen}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-left text-sm text-slate-600 shadow-sm shadow-slate-200/60 transition hover:border-brand-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-600">
                    {initials}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block font-semibold text-slate-800">{coach?.name ?? 'Coach'}</span>
                    <span className="text-xs text-slate-500">Administrador</span>
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
                    <div className="space-y-1 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sesión</p>
                      <p className="text-sm font-medium text-slate-800">{coach?.name ?? 'Usuario'}</p>
                      {coach?.email && <p className="text-xs text-slate-500">{coach.email}</p>}
                    </div>
                    <div className="my-2 h-px bg-slate-200" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Cerrar sesión
                      <span aria-hidden>↩</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}
              >
                Ingresar
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}
              >
                Registrarse
              </NavLink>
            </>
          )}
        </nav>
        {isMobileOpen && (
          <div ref={mobileMenuRef} className="absolute left-0 right-0 top-full z-40 border-b border-slate-200 bg-white p-3 shadow-surface md:hidden">
            {token ? (
              <div className="space-y-2">
                <NavLink to="/students" onClick={() => setIsMobileOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                  Alumnos
                </NavLink>
                <NavLink to="/lessons" onClick={() => setIsMobileOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                  Clases
                </NavLink>
                <button
                  onClick={() => {
                    setIsMobileOpen(false)
                    logout()
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <NavLink to="/login" onClick={() => setIsMobileOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                  Ingresar
                </NavLink>
                <NavLink to="/register" onClick={() => setIsMobileOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                  Registrarse
                </NavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
