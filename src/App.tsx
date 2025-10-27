import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Students from './pages/Students'
import Lessons from './pages/Lessons'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(13,131,255,0.12),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_55%)]" />
        <Nav />
        <main className="px-4 pb-16 pt-6 text-slate-900 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-10">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Students />} />
                <Route path="/students" element={<Students />} />
                <Route path="/lessons" element={<Lessons />} />
              </Route>
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
