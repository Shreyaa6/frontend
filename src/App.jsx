import { useState, useEffect } from 'react'
import LoginSignup from './login_signup'
import Landing from './Landing'
import Dashboard from './Dashboard'
import { tokenManager } from './api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // Check if user has a token
    const token = tokenManager.get()
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  if (!isAuthenticated) {
    return <LoginSignup onLogin={handleLogin} />
  }

  if (currentPage === 'dashboard') {
    return <Dashboard onNavigate={handleNavigate} currentPage={currentPage} />
  }

  return <Landing onStartTripping={() => setCurrentPage('dashboard')} onNavigate={handleNavigate} currentPage={currentPage} />
}

export default App
