import './Nav.css'

function Nav({ className = '', onNavigate, currentPage }) {
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
    { id: 'trips', label: 'Trips' },
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
            {currentPage === item.id && <span className="active-dot"></span>}
            {item.label}
          </button>
        ))}
        <button className="nav-add-btn" title="Add">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default Nav

