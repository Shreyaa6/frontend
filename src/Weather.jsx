import { useState } from 'react'
import Nav from './Nav'
import { api } from './api'
import './Weather.css'

function Weather({ onNavigate, currentPage, onLogout, showError, showSuccess }) {
  const [location, setLocation] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!location.trim()) {
      showError('Please enter a location')
      return
    }

    setLoading(true)
    try {
      const response = await api.getWeatherForecast(location, 5, 'metric', 'en')
      setWeatherData(response.data)
      showSuccess('Weather data loaded!')
    } catch (error) {
      showError(error.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    if (!condition) return '☀️'
    const lower = condition.toLowerCase()
    if (lower.includes('rain')) return '🌧️'
    if (lower.includes('cloud')) return '☁️'
    if (lower.includes('snow')) return '❄️'
    if (lower.includes('sun')) return '☀️'
    if (lower.includes('wind')) return '💨'
    return '🌤️'
  }

  return (
    <div className="weather-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
      
      <div className="weather-content">
        <div className="weather-header">
          <h1 className="weather-title">Weather Forecast</h1>
          <p className="weather-subtitle">Check weather conditions for your destination</p>
        </div>

        {/* Search Form */}
        <form className="weather-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3.33331 8.33333C3.33331 13.3333 10 18.3333 10 18.3333C10 18.3333 16.6666 13.3333 16.6666 8.33333C16.6666 6.44928 15.8774 4.64144 14.4406 3.2046C13.0038 1.76777 11.196 0.978577 9.31198 0.978577C7.42793 0.978577 5.62009 1.76777 4.18325 3.2046C2.74641 4.64144 1.95722 6.44928 1.95722 8.33333H3.33331Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <input
              type="text"
              placeholder="Enter city name (e.g., London, New York, Tokyo)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="weather-search-input"
            />
            <button type="submit" className="weather-search-btn" disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Weather Display */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        )}

        {weatherData && !loading && (
          <div className="weather-results">
            {weatherData.list && weatherData.list.length > 0 ? (
              <>
                {/* Current Weather */}
                <div className="current-weather">
                  <h2 className="location-name">{weatherData.city?.name || location}</h2>
                  {weatherData.list[0] && (
                    <div className="current-weather-card">
                      <div className="weather-icon-large">
                        {getWeatherIcon(weatherData.list[0].weather?.[0]?.main)}
                      </div>
                      <div className="weather-temp-large">
                        {Math.round(weatherData.list[0].main?.temp || 0)}°C
                      </div>
                      <div className="weather-condition">
                        {weatherData.list[0].weather?.[0]?.description || 'N/A'}
                      </div>
                      <div className="weather-details">
                        <div className="detail-item">
                          <span className="detail-label">Feels like</span>
                          <span className="detail-value">
                            {Math.round(weatherData.list[0].main?.feels_like || 0)}°C
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Humidity</span>
                          <span className="detail-value">
                            {weatherData.list[0].main?.humidity || 0}%
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Wind</span>
                          <span className="detail-value">
                            {weatherData.list[0].wind?.speed || 0} m/s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Forecast */}
                <div className="forecast-section">
                  <h2 className="section-title">5-Day Forecast</h2>
                  <div className="forecast-grid">
                    {weatherData.list.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="forecast-card">
                        <div className="forecast-date">
                          {new Date(item.dt * 1000).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="forecast-time">
                          {new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="forecast-icon">
                          {getWeatherIcon(item.weather?.[0]?.main)}
                        </div>
                        <div className="forecast-temp">
                          {Math.round(item.main?.temp || 0)}°C
                        </div>
                        <div className="forecast-condition">
                          {item.weather?.[0]?.description || 'N/A'}
                        </div>
                        <div className="forecast-details">
                          <span>H: {Math.round(item.main?.temp_max || 0)}°</span>
                          <span>L: {Math.round(item.main?.temp_min || 0)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>No weather data available for this location</p>
              </div>
            )}
          </div>
        )}

        {/* Popular Locations */}
        {!weatherData && !loading && (
          <div className="popular-locations">
            <h2 className="section-title">Popular Locations</h2>
            <div className="locations-grid">
              {['London', 'New York', 'Tokyo', 'Paris', 'Dubai', 'Goa'].map((loc) => (
                <div
                  key={loc}
                  className="location-card"
                  onClick={async () => {
                    setLocation(loc)
                    setLoading(true)
                    try {
                      const response = await api.getWeatherForecast(loc, 5, 'metric', 'en')
                      setWeatherData(response.data)
                      showSuccess('Weather data loaded!')
                    } catch (error) {
                      showError(error.message || 'Failed to fetch weather data')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  <h3>{loc}</h3>
                  <p>Click to check weather</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Weather

