import { useState, useEffect } from 'react'
import LoginSignup from './login_signup'
import Landing from './Landing'
import Dashboard from './Dashboard'
import CreateTrip from './CreateTrip'
import Explore from './Explore'
import BudgetPlanner from './BudgetPlanner'
import Weather from './Weather'
import { tokenManager } from './api'
import { useNotification } from './useNotification'
import Notification from './Notification'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const { notifications, removeNotification, showSuccess, showError } = useNotification()

  useEffect(() => {
    // Check if user has a token
    const token = tokenManager.get()
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    showSuccess('Login successful!')
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleLogout = () => {
    tokenManager.remove()
    setIsAuthenticated(false)
    setCurrentPage('home')
    showSuccess('Logged out successfully')
  }

  return (
    <>
      {notifications.map(notif => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          duration={notif.duration}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
      
      {!isAuthenticated ? (
        <LoginSignup onLogin={handleLogin} showError={showError} showSuccess={showSuccess} />
      ) : currentPage === 'dashboard' ? (
        <Dashboard onNavigate={handleNavigate} currentPage={currentPage} onLogout={handleLogout} showError={showError} showSuccess={showSuccess} />
      ) : currentPage === 'create-trip' ? (
        <CreateTrip onNavigate={handleNavigate} currentPage={currentPage} onLogout={handleLogout} showError={showError} showSuccess={showSuccess} />
      ) : currentPage === 'explore' ? (
        <Explore onNavigate={handleNavigate} currentPage={currentPage} onLogout={handleLogout} showError={showError} showSuccess={showSuccess} />
      ) : currentPage === 'budget-planner' ? (
        <BudgetPlanner onNavigate={handleNavigate} currentPage={currentPage} onLogout={handleLogout} showError={showError} showSuccess={showSuccess} />
      ) : currentPage === 'weather' ? (
        <Weather onNavigate={handleNavigate} currentPage={currentPage} onLogout={handleLogout} showError={showError} showSuccess={showSuccess} />
      ) : (
        <Landing 
          onStartTripping={() => setCurrentPage('dashboard')} 
          onNavigate={handleNavigate} 
          currentPage={currentPage} 
          onLogout={handleLogout}
          showError={showError}
          showSuccess={showSuccess}
        />
      )}
    </>
  )
}

export default App
