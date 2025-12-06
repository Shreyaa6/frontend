import { useState, useEffect, useRef } from 'react'
import landingImage from './assets/landing.jpg'
import l2Image from './assets/l2.jpg'
import l3Image from './assets/l3.jpg'
import l4Image from './assets/l4.jpg'
import l5Image from './assets/l5.jpg'
import l6Image from './assets/l6.jpg'
import l7Image from './assets/l7.jpg'
import logoImage from './assets/logo.png'
import Nav from './Nav'
import './Landing.css'

function Landing({ onStartTripping, onNavigate, currentPage, onLogout, showError, showSuccess }) {
  const images = [landingImage, l2Image, l3Image, l4Image, l5Image, l6Image, l7Image]
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollTimeout = useRef(null)
  const isChanging = useRef(false)
  const lastChangeTime = useRef(0)
  const debounceTimeout = useRef(null)

  useEffect(() => {
    const handleWheel = (e) => {
      // Prevent changes if already transitioning
      if (isChanging.current) return

      const now = Date.now()
      const timeSinceLastChange = now - lastChangeTime.current
      
      // Require at least 200ms between changes
      if (timeSinceLastChange < 200) return

      const direction = e.deltaY > 0 ? 'down' : 'up'
      
      // Clear any pending debounce
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
      
      // Debounce to wait for scroll gesture to settle
      debounceTimeout.current = setTimeout(() => {
        // Double check we're still not changing
        if (isChanging.current) return
        
        isChanging.current = true
        lastChangeTime.current = Date.now()
        
        // Change image
        if (direction === 'down') {
          setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : prev))
        } else {
          setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))
        }
        
        // Reset after transition completes
        setTimeout(() => {
          isChanging.current = false
        }, 50)
      }, 150)
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [images.length])

  return (
    <div className="landing-container">
      {/* Left Section - Image Background */}
      <div className="landing-left">
        {images.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt="Desert landscape" 
            className={`landing-bg-image ${currentIndex === index ? 'active' : ''}`}
          />
        ))}
        <div className="landing-logo">
          <img src={logoImage} alt="Logo" className="logo-image" />
        </div>
      </div>

      {/* Right Section - Content */}
      <div className="landing-right">
        <Nav className="sticky" onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />

        <div className="landing-content">
          <h1 className="landing-title" style={{ '--bg-image': `url(${images[currentIndex]})` }}>
            <span className="title-word">where</span>{' '}
            <span className="title-word">every</span>{' '}
            <span className="title-word">journey</span>{' '}
            <span className="title-word">feels</span>{' '}
            <span className="title-word">like</span>{' '}
            <span className="title-word">coming</span>{' '}
            <span className="title-word">home</span>
            <span className="title-ellipsis">...</span>
          </h1>
        </div>

        <div className="landing-pagination">
          <div className="pagination-current">{String(currentIndex + 1).padStart(2, '0')}</div>
          <div className="pagination-separator"></div>
          <div className="pagination-total">{String(images.length).padStart(2, '0')}</div>
        </div>

        <div className="start-tripping-button">
          <button className="tripping-btn" onClick={onStartTripping}>
            <span>start tripping</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Landing

