import { useState } from 'react'
import Nav from './Nav'
import { api } from './api'
import './Explore.css'

function Explore({ onNavigate, currentPage, onLogout, showError, showSuccess }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('places')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      showError('Please enter a destination')
      return
    }

    setLoading(true)
    try {
      // Get Gemini suggestions
      const geminiResponse = await api.geminiTripSuggestions(
        searchQuery,
        5, // default 5 days
        'medium',
        ['exploration', 'food', 'culture']
      )

      // Get restaurants if location ID is available
      let restaurants = null
      try {
        // Using a default location ID for demo - in production, you'd geocode the city
        const restaurantResponse = await api.searchRestaurants('304554') // Example: Goa location ID
        restaurants = restaurantResponse.data
      } catch (err) {
        console.log('Restaurant search failed:', err)
      }

      setResults({
        gemini: geminiResponse.suggestions || geminiResponse.raw,
        restaurants: restaurants
      })
      showSuccess('Exploration data loaded!')
    } catch (error) {
      showError(error.message || 'Failed to load exploration data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="explore-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
      
      <div className="explore-content">
        <div className="explore-header">
          <h1 className="explore-title">Explore Destinations</h1>
          <p className="explore-subtitle">Discover places, food, and experiences</p>
        </div>

        {/* Search Form */}
        <form className="explore-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search for a destination (e.g., Goa, Paris, Tokyo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="explore-search-input"
            />
            <button type="submit" className="explore-search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results Tabs */}
        {results && (
          <div className="results-tabs">
            <button
              className={`result-tab ${activeTab === 'places' ? 'active' : ''}`}
              onClick={() => setActiveTab('places')}
            >
              Places to Visit
            </button>
            <button
              className={`result-tab ${activeTab === 'food' ? 'active' : ''}`}
              onClick={() => setActiveTab('food')}
            >
              Food & Cuisine
            </button>
            <button
              className={`result-tab ${activeTab === 'itinerary' ? 'active' : ''}`}
              onClick={() => setActiveTab('itinerary')}
            >
              Itinerary
            </button>
            <button
              className={`result-tab ${activeTab === 'tips' ? 'active' : ''}`}
              onClick={() => setActiveTab('tips')}
            >
              Travel Tips
            </button>
          </div>
        )}

        {/* Results Display */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Exploring {searchQuery}...</p>
          </div>
        )}

        {results && !loading && (
          <div className="results-container">
            {activeTab === 'places' && (
              <div className="results-section">
                <h2 className="section-title">Places to Visit in {searchQuery}</h2>
                <div className="places-grid">
                  {results.gemini?.itinerary ? (
                    results.gemini.itinerary.map((day, idx) => (
                      <div key={idx} className="place-card">
                        <h3 className="place-day">Day {day.day || idx + 1}</h3>
                        {day.places && day.places.length > 0 && (
                          <ul className="place-list">
                            {day.places.map((place, pIdx) => (
                              <li key={pIdx}>{place}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="info-text">
                      {typeof results.gemini === 'string' ? (
                        <div className="gemini-text" dangerouslySetInnerHTML={{ __html: results.gemini.replace(/\n/g, '<br/>') }} />
                      ) : (
                        <p>No places data available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'food' && (
              <div className="results-section">
                <h2 className="section-title">Food & Cuisine in {searchQuery}</h2>
                {results.gemini?.itinerary ? (
                  <div className="food-grid">
                    {results.gemini.itinerary.map((day, idx) => (
                      day.restaurants && day.restaurants.length > 0 && (
                        <div key={idx} className="food-card">
                          <h3 className="food-day">Day {day.day || idx + 1}</h3>
                          <ul className="food-list">
                            {day.restaurants.map((restaurant, rIdx) => (
                              <li key={rIdx}>{restaurant}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="info-text">
                    {results.restaurants ? (
                      <div className="restaurant-list">
                        {results.restaurants.data?.data?.map((restaurant, idx) => (
                          <div key={idx} className="restaurant-card">
                            <h3>{restaurant.name}</h3>
                            <p>{restaurant.address}</p>
                            {restaurant.rating && <p>Rating: {restaurant.rating}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No restaurant data available</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="results-section">
                <h2 className="section-title">Recommended Itinerary</h2>
                <div className="itinerary-container">
                  {results.gemini?.itinerary ? (
                    results.gemini.itinerary.map((day, idx) => (
                      <div key={idx} className="itinerary-day">
                        <h3 className="itinerary-day-title">Day {day.day || idx + 1}</h3>
                        {day.activities && day.activities.length > 0 && (
                          <div className="itinerary-activities">
                            <h4>Activities:</h4>
                            <ul>
                              {day.activities.map((activity, aIdx) => (
                                <li key={aIdx}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="info-text">
                      {typeof results.gemini === 'string' ? (
                        <div className="gemini-text" dangerouslySetInnerHTML={{ __html: results.gemini.replace(/\n/g, '<br/>') }} />
                      ) : (
                        <p>No itinerary data available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="results-section">
                <h2 className="section-title">Travel Tips for {searchQuery}</h2>
                <div className="tips-container">
                  {results.gemini?.tips ? (
                    <ul className="tips-list">
                      {results.gemini.tips.map((tip, idx) => (
                        <li key={idx} className="tip-item">{tip}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="info-text">
                      {typeof results.gemini === 'string' ? (
                        <div className="gemini-text" dangerouslySetInnerHTML={{ __html: results.gemini.replace(/\n/g, '<br/>') }} />
                      ) : (
                        <p>No tips available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Popular Destinations */}
        {!results && (
          <div className="popular-destinations">
            <h2 className="section-title">Popular Destinations</h2>
            <div className="destinations-grid">
              {['Goa', 'Paris', 'Tokyo', 'Bali', 'Dubai', 'New York'].map((dest) => (
                <div
                  key={dest}
                  className="destination-card"
                  onClick={async () => {
                    setSearchQuery(dest)
                    setLoading(true)
                    try {
                      const geminiResponse = await api.geminiTripSuggestions(
                        dest,
                        5,
                        'medium',
                        ['exploration', 'food', 'culture']
                      )
                      let restaurants = null
                      try {
                        const restaurantResponse = await api.searchRestaurants('304554')
                        restaurants = restaurantResponse.data
                      } catch (err) {
                        console.log('Restaurant search failed:', err)
                      }
                      setResults({
                        gemini: geminiResponse.suggestions || geminiResponse.raw,
                        restaurants: restaurants
                      })
                      showSuccess('Exploration data loaded!')
                    } catch (error) {
                      showError(error.message || 'Failed to load exploration data')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  <h3>{dest}</h3>
                  <p>Click to explore</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore

