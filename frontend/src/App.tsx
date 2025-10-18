import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Navigation } from '@/components/Navigation'
import { Home } from '@/pages/Home'
import { ManageGoals } from '@/pages/ManageGoals'
import { GoalHistory } from '@/pages/GoalHistory'

function AppContent() {
  const location = useLocation()
  const showNavigation = !location.pathname.includes('/history')

  return (
    <>
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manage" element={<ManageGoals />} />
        <Route path="/goal/:goalId/history" element={<GoalHistory />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppContent />
    </BrowserRouter>
  )
}

export default App
