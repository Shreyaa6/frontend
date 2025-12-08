import { useState, useEffect } from 'react'
import Nav from './Nav'
import { api } from './api'
import './Dashboard.css'

function Dashboard({ onNavigate, currentPage, onLogout, showError, showSuccess }) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all') // all, upcoming, past, cancelled
  const [sortBy, setSortBy] = useState('date') // date, destination, status
  const [sortOrder, setSortOrder] = useState('asc') // asc, desc
  const [searchQuery, setSearchQuery] = useState('')
  
  // Budget states
  const [budgets, setBudgets] = useState([])
  const [budgetsLoading, setBudgetsLoading] = useState(true)
  const [budgetFilter, setBudgetFilter] = useState('all') // all, with-trip, without-trip
  const [budgetSortBy, setBudgetSortBy] = useState('date') // date, name, total
  const [budgetSearchQuery, setBudgetSearchQuery] = useState('')

  const [recommendations] = useState([
    { id: 1, name: 'Bali', type: 'Places you may like', reason: 'Based on your travel style' },
    { id: 2, name: 'Tokyo', type: 'Trending this month', reason: 'Popular destination' },
    { id: 3, name: 'Santorini', type: 'Hidden gem', reason: 'Near your selected destination' }
  ])
  
  // Recommendations filter/sort states
  const [recommendationSearchQuery, setRecommendationSearchQuery] = useState('')
  const [recommendationFilter, setRecommendationFilter] = useState('all') // all, trending, hidden-gem, places-you-may-like
  const [recommendationSortBy, setRecommendationSortBy] = useState('name') // name, type

  // Fetch trips and budgets on component mount
  useEffect(() => {
    fetchTrips()
    fetchBudgets()
  }, [])

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const response = await api.getTrips()
      if (response.success && response.trips) {
        setTrips(response.trips)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
      showError('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgets = async () => {
    setBudgetsLoading(true)
    try {
      const response = await api.getBudgets()
      if (response.success && response.budgets) {
        setBudgets(response.budgets)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
      showError('Failed to load budgets')
    } finally {
      setBudgetsLoading(false)
    }
  }

  const handleDeleteTrip = async (tripId, tripDestination) => {
    if (!window.confirm(`Are you sure you want to delete your trip to ${tripDestination}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await api.deleteTrip(tripId)
      if (response.success) {
        showSuccess('Trip deleted successfully')
        // Refresh trips list
        fetchTrips()
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
      showError(error.message || 'Failed to delete trip')
    }
  }

  const handleDeleteBudget = async (budgetId, budgetName) => {
    if (!window.confirm(`Are you sure you want to delete "${budgetName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await api.deleteBudget(budgetId)
      if (response.success) {
        showSuccess('Budget deleted successfully')
        fetchBudgets()
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      showError(error.message || 'Failed to delete budget')
    }
  }

  const calculateBudgetTotal = (budget) => {
    return (budget.accommodation || 0) + 
           (budget.food || 0) + 
           (budget.transportation || 0) + 
           (budget.activities || 0) + 
           (budget.miscellaneous || 0)
  }

  // Helper function to calculate days until trip
  const getDaysUntil = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tripDate = new Date(date)
    tripDate.setHours(0, 0, 0, 0)
    const diffTime = tripDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Helper function to check if trip is past
  const isPastTrip = (endDate) => {
    return new Date(endDate) < new Date()
  }

  // Filter and sort trips
  const filteredAndSortedTrips = trips
    .filter(trip => {
      // Filter by status
      if (filterStatus === 'upcoming' && (isPastTrip(trip.endDate) || trip.status !== 'upcoming')) {
        return false
      }
      if (filterStatus === 'past' && !isPastTrip(trip.endDate)) {
        return false
      }
      if (filterStatus === 'cancelled' && trip.status !== 'cancelled') {
        return false
      }
      // Filter by search query
      if (searchQuery && !trip.destination.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(a.startDate) - new Date(b.startDate)
      } else if (sortBy === 'destination') {
        comparison = a.destination.localeCompare(b.destination)
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Separate trips by status for display
  const upcomingTrips = filteredAndSortedTrips.filter(trip => !isPastTrip(trip.endDate) && trip.status === 'upcoming')
  const pastTrips = filteredAndSortedTrips.filter(trip => isPastTrip(trip.endDate))
  const cancelledTrips = filteredAndSortedTrips.filter(trip => trip.status === 'cancelled')

  // Filter and sort budgets
  const filteredAndSortedBudgets = budgets
    .filter(budget => {
      // Filter by trip link
      if (budgetFilter === 'with-trip' && !budget.tripId) {
        return false
      }
      if (budgetFilter === 'without-trip' && budget.tripId) {
        return false
      }
      // Filter by search query
      if (budgetSearchQuery && !budget.name.toLowerCase().includes(budgetSearchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      if (budgetSortBy === 'date') {
        comparison = new Date(b.createdAt) - new Date(a.createdAt) // Newest first
      } else if (budgetSortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (budgetSortBy === 'total') {
        comparison = calculateBudgetTotal(b) - calculateBudgetTotal(a) // Highest first
      }
      return comparison
    })


  const [savedPlaces] = useState([
    { id: 1, name: 'Eiffel Tower', type: 'Attraction', location: 'Paris' },
    { id: 2, name: 'Le Comptoir', type: 'Restaurant', location: 'Paris' },
    { id: 3, name: 'Secret Beach', type: 'Hidden Gem', location: 'Goa' }
  ])
  
  // Saved Places filter/sort states
  const [savedPlaceSearchQuery, setSavedPlaceSearchQuery] = useState('')
  const [savedPlaceFilter, setSavedPlaceFilter] = useState('all') // all, attraction, restaurant, hidden-gem
  const [savedPlaceSortBy, setSavedPlaceSortBy] = useState('name') // name, location, type

  const handleAddToItinerary = (place) => {
    // Navigate to create-trip with the place location pre-filled
    onNavigate('create-trip', null, 'create', place.location)
    showSuccess(`Adding ${place.name} to your trip!`)
  }

  // Filter and sort recommendations
  const filteredAndSortedRecommendations = recommendations
    .filter(rec => {
      // Filter by type
      if (recommendationFilter === 'trending' && rec.type !== 'Trending this month') {
        return false
      }
      if (recommendationFilter === 'hidden-gem' && rec.type !== 'Hidden gem') {
        return false
      }
      if (recommendationFilter === 'places-you-may-like' && rec.type !== 'Places you may like') {
        return false
      }
      // Filter by search query
      if (recommendationSearchQuery && !rec.name.toLowerCase().includes(recommendationSearchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (recommendationSortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (recommendationSortBy === 'type') {
        return a.type.localeCompare(b.type)
      }
      return 0
    })

  // Filter and sort saved places
  const filteredAndSortedSavedPlaces = savedPlaces
    .filter(place => {
      // Filter by type
      if (savedPlaceFilter === 'attraction' && place.type !== 'Attraction') {
        return false
      }
      if (savedPlaceFilter === 'restaurant' && place.type !== 'Restaurant') {
        return false
      }
      if (savedPlaceFilter === 'hidden-gem' && place.type !== 'Hidden Gem') {
        return false
      }
      // Filter by search query
      if (savedPlaceSearchQuery && !place.name.toLowerCase().includes(savedPlaceSearchQuery.toLowerCase()) && 
          !place.location.toLowerCase().includes(savedPlaceSearchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (savedPlaceSortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (savedPlaceSortBy === 'location') {
        return a.location.localeCompare(b.location)
      } else if (savedPlaceSortBy === 'type') {
        return a.type.localeCompare(b.type)
      }
      return 0
    })

  return (
    <div className="home-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
      <div className="home-header">
        <h1 className="home-title">Your Travel Dashboard</h1>
        <p className="home-subtitle">Plan and relive your journeys</p>
      </div>

      <div className="home-content">
        {/* 1. All Trips with Filters and Sorting */}
        <section className="home-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>My Trips</h2>
            
            {/* Filters and Sort Controls */}
            <div className="filter-controls">
              {/* Search */}
              <div className="search-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Status Filter */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Trips</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="destination">Sort by Destination</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <button
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>Loading trips...</div>
          ) : filteredAndSortedTrips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>
              <p>No trips found. {searchQuery && 'Try adjusting your search.'}</p>
              <button
                onClick={() => onNavigate('create-trip')}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: '#11120D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Create Your First Trip
              </button>
            </div>
          ) : (
            <div className="trips-grid">
              {filteredAndSortedTrips.map(trip => {
                const daysUntil = getDaysUntil(trip.startDate)
                const isPast = isPastTrip(trip.endDate)
                
                return (
                  <div key={trip.id} className="trip-card">
                    <div className="trip-header">
                      <h3 className="trip-destination">{trip.destination}</h3>
                      <span className="trip-countdown" style={{ 
                        color: isPast ? '#999' : daysUntil < 7 ? '#e74c3c' : '#27ae60' 
                      }}>
                        {isPast ? 'Past' : daysUntil > 0 ? `${daysUntil} days left` : 'Today'}
                      </span>
                    </div>
                    <p className="trip-dates">{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: trip.status === 'upcoming' ? '#e3f2fd' : trip.status === 'cancelled' ? '#ffebee' : '#f3e5f5',
                        color: trip.status === 'upcoming' ? '#1976d2' : trip.status === 'cancelled' ? '#c62828' : '#7b1fa2',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {trip.status}
                      </span>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {trip.transportationType}
                      </span>
                      {trip.travelers && (
                        <span style={{ 
                          padding: '4px 8px', 
                          background: '#f5f5f5',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                        </span>
                      )}
                    </div>
                    <div className="trip-actions">
                      <button className="action-btn" onClick={() => onNavigate('create-trip', trip.id, 'view')}>View Details</button>
                      <button className="action-btn secondary" onClick={() => onNavigate('create-trip', trip.id, 'edit')}>Edit</button>
                      <button 
                        className="action-btn" 
                        onClick={() => handleDeleteTrip(trip.id, trip.destination)}
                        style={{ 
                          background: '#e74c3c', 
                          color: '#fff',
                          border: 'none'
                        }}
                        title="Delete trip"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 2. Budgets Section */}
        <section className="home-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>My Budgets</h2>
            
            {/* Budget Filters and Sort Controls */}
            <div className="filter-controls">
              {/* Search */}
              <div className="search-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search budget..."
                  value={budgetSearchQuery}
                  onChange={(e) => setBudgetSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                >
                  <option value="all">All Budgets</option>
                  <option value="with-trip">With Trip</option>
                  <option value="without-trip">Without Trip</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={budgetSortBy}
                  onChange={(e) => setBudgetSortBy(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="total">Sort by Total</option>
                </select>
              </div>
            </div>
          </div>

          {budgetsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>Loading budgets...</div>
          ) : filteredAndSortedBudgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>
              <p>No budgets found. {budgetSearchQuery && 'Try adjusting your search.'}</p>
              <button
                onClick={() => onNavigate('budget-planner')}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: '#11120D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="trips-grid">
              {filteredAndSortedBudgets.map(budget => {
                const budgetTotal = calculateBudgetTotal(budget)
                return (
                  <div key={budget.id} className="trip-card">
                    <div className="trip-header">
                      <h3 className="trip-destination">{budget.name}</h3>
                      {budget.trip && (
                        <span className="trip-countdown" style={{ background: 'rgba(86, 84, 73, 0.1)' }}>
                          {budget.trip.destination}
                        </span>
                      )}
                    </div>
                    <p className="trip-dates" style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '12px' }}>
                      {budget.currency || 'USD'} {budgetTotal.toFixed(2)}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', fontSize: '0.9rem', color: '#565449' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Accommodation:</span>
                        <span>{budget.currency || 'USD'} {(budget.accommodation || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Food:</span>
                        <span>{budget.currency || 'USD'} {(budget.food || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Transportation:</span>
                        <span>{budget.currency || 'USD'} {(budget.transportation || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Activities:</span>
                        <span>{budget.currency || 'USD'} {(budget.activities || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Miscellaneous:</span>
                        <span>{budget.currency || 'USD'} {(budget.miscellaneous || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="trip-actions">
                      <button className="action-btn" onClick={() => onNavigate('budget-planner')}>View Details</button>
                      <button 
                        className="action-btn secondary" 
                        onClick={() => handleDeleteBudget(budget.id, budget.name)}
                        style={{ 
                          background: '#e74c3c', 
                          color: '#fff',
                          border: 'none'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 3. Smart Recommendations */}
        <section className="home-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Smart Recommendations</h2>
            
            {/* Recommendations Filters and Sort Controls */}
            <div className="filter-controls">
              {/* Search */}
              <div className="search-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search recommendations..."
                  value={recommendationSearchQuery}
                  onChange={(e) => setRecommendationSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={recommendationFilter}
                  onChange={(e) => setRecommendationFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="trending">Trending</option>
                  <option value="hidden-gem">Hidden Gem</option>
                  <option value="places-you-may-like">Places You May Like</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={recommendationSortBy}
                  onChange={(e) => setRecommendationSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>
            </div>
          </div>

          {filteredAndSortedRecommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>
              <p>No recommendations found. {recommendationSearchQuery && 'Try adjusting your search.'}</p>
            </div>
          ) : (
            <div className="recommendations-grid">
              {filteredAndSortedRecommendations.map(rec => (
                <div 
                  key={rec.id} 
                  className="recommendation-card"
                  onClick={() => onNavigate('create-trip', null, 'create', rec.name)}
                  title={`Plan a trip to ${rec.name}`}
                >
                  <div className="rec-badge">{rec.type}</div>
                  <h3 className="rec-name">{rec.name}</h3>
                  <p className="rec-reason">{rec.reason}</p>
                </div>
              ))}
            </div>
          )}
        </section>


        {/* 4. Saved Places & Favorites */}
        <section className="home-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Saved Places</h2>
            
            {/* Saved Places Filters and Sort Controls */}
            <div className="filter-controls">
              {/* Search */}
              <div className="search-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search places..."
                  value={savedPlaceSearchQuery}
                  onChange={(e) => setSavedPlaceSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={savedPlaceFilter}
                  onChange={(e) => setSavedPlaceFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="attraction">Attraction</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hidden-gem">Hidden Gem</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div className="filter-wrapper">
                <select
                  className="filter-select"
                  value={savedPlaceSortBy}
                  onChange={(e) => setSavedPlaceSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="location">Sort by Location</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>
            </div>
          </div>

          {filteredAndSortedSavedPlaces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>
              <p>No saved places found. {savedPlaceSearchQuery && 'Try adjusting your search.'}</p>
            </div>
          ) : (
            <div className="saved-places-grid">
              {filteredAndSortedSavedPlaces.map(place => (
                <div key={place.id} className="saved-place-card">
                  <div className="place-type-badge">{place.type}</div>
                  <h3 className="place-name">{place.name}</h3>
                  <p className="place-location">{place.location}</p>
                  <button 
                    className="add-to-itinerary-btn"
                    onClick={() => handleAddToItinerary(place)}
                  >
                    Add to Itinerary
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard

