import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import SEO from './components/ui/SEO'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Students = lazy(() => import('./pages/Students'))
const Lessons = lazy(() => import('./pages/Lessons'))
const Settings = lazy(() => import('./pages/Settings'))

const LoadingSpinner = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
  </div>
)

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SEO />
      <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(13,131,255,0.12),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_55%)]" />
        <Nav />
        <main className="px-4 pb-16 pt-6 text-slate-900 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-10">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Students />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/lessons" element={<Lessons />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </main>

        <footer className="border-t border-slate-200 bg-white/50 py-8 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 md:px-6 lg:px-8">
            <div className="mb-4 flex justify-center gap-6">
              <a href="/privacy.html" className="hover:text-brand-600">Privacidad</a>
              <a href="/terms.html" className="hover:text-brand-600">Términos</a>
              <a href="mailto:soporte@gestion-tenis.com" className="hover:text-brand-600">Soporte</a>
            </div>
            <p>© {new Date().getFullYear()} Gestión Tenis. Todos los derechos reservados.</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">v0.1.0 • Enterprise Edition</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
