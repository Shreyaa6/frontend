import './Nav.css'

function Nav({ className = '', onNavigate, currentPage, onLogout }) {
  const handleClick = (e, section) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate(section)
    }
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'create-trip', label: 'Create Trip' },
    { id: 'explore', label: 'Explore' },
    { id: 'budget-planner', label: 'Budget Planner' },
    { id: 'weather', label: 'Weather' }
  ]

  // If it's the sticky (Home/Landing page), use simple links
  if (className.includes('sticky')) {
    return (
      <nav className={`main-nav ${className}`}>
        {navItems.map(item => (
          <a 
            key={item.id}
            href={`#${item.id}`} 
            onClick={(e) => handleClick(e, item.id)}
            className={currentPage === item.id ? 'active' : ''}
          >
            {item.label}
          </a>
        ))}
        {onLogout && (
          <button className="nav-logout-btn-sticky" onClick={onLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 14H3C2.46957 14 1.96086 13.7893 1.58579 13.4142C1.21071 13.0391 1 12.5304 1 12V4C1 3.46957 1.21071 2.96086 1.58579 2.58579C1.96086 2.21071 2.46957 2 3 2H6M11 11L15 8M15 8L11 5M15 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </nav>
    )
  }

  // For other pages, use pill/tag style
  return (
    <nav className={`main-nav pill-nav ${className}`}>
      <div className="nav-pills-container">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-pill ${currentPage === item.id ? 'active' : ''}`}
            onClick={(e) => handleClick(e, item.id)}
          >
            {item.label}
          </button>
        ))}
        {onLogout && (
          <button className="nav-logout-btn" onClick={onLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 14H3C2.46957 14 1.96086 13.7893 1.58579 13.4142C1.21071 13.0391 1 12.5304 1 12V4C1 3.46957 1.21071 2.96086 1.58579 2.58579C1.96086 2.21071 2.46957 2 3 2H6M11 11L15 8M15 8L11 5M15 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </nav>
  )
}

export default Nav

