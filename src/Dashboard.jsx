import { useState } from 'react'
import Nav from './Nav'
import './Dashboard.css'

function Dashboard({ onNavigate, currentPage }) {
  const [upcomingTrips] = useState([
    {
      id: 1,
      destination: 'Goa',
      startDate: '15 Feb',
      endDate: '19 Feb',
      daysLeft: 12,
      itineraryReady: true
    },
    {
      id: 2,
      destination: 'Paris',
      startDate: '1 Mar',
      endDate: '7 Mar',
      daysLeft: 28,
      itineraryReady: false
    }
  ])

  const [recommendations] = useState([
    { id: 1, name: 'Bali', type: 'Places you may like', reason: 'Based on your travel style' },
    { id: 2, name: 'Tokyo', type: 'Trending this month', reason: 'Popular destination' },
    { id: 3, name: 'Santorini', type: 'Hidden gem', reason: 'Near your selected destination' }
  ])

  const [pastTrips] = useState([
    { id: 1, destination: 'Maldives', date: 'Dec 2023', photos: 45 },
    { id: 2, destination: 'Switzerland', date: 'Oct 2023', photos: 78 },
    { id: 3, destination: 'Dubai', date: 'Aug 2023', photos: 32 }
  ])

  const [weather] = useState([
    { location: 'Home', temp: '22°C', condition: 'Sunny', days: ['22°', '24°', '23°', '25°'] },
    { location: 'Goa', temp: '28°C', condition: 'Partly Cloudy', days: ['28°', '29°', '30°', '28°'] }
  ])

  const [notifications] = useState([
    { id: 1, type: 'reminder', message: 'Trip starts in 3 days!', time: '2h ago' },
    { id: 2, type: 'price', message: 'Flight price dropped 15%', time: '5h ago' },
    { id: 3, type: 'weather', message: 'Weather alert: Rain expected', time: '1d ago' }
  ])

  const [savedPlaces] = useState([
    { id: 1, name: 'Eiffel Tower', type: 'Attraction', location: 'Paris' },
    { id: 2, name: 'Le Comptoir', type: 'Restaurant', location: 'Paris' },
    { id: 3, name: 'Secret Beach', type: 'Hidden Gem', location: 'Goa' }
  ])

  return (
    <div className="home-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} />
      <div className="home-header">
        <h1 className="home-title">Your Travel Dashboard</h1>
        <p className="home-subtitle">Plan, explore, and relive your journeys</p>
      </div>

      <div className="home-content">
        {/* 1. Overview of Upcoming & Active Trips */}
        <section className="home-section">
          <h2 className="section-title">Upcoming Trips</h2>
          <div className="trips-grid">
            {upcomingTrips.map(trip => (
              <div key={trip.id} className="trip-card">
                <div className="trip-header">
                  <h3 className="trip-destination">{trip.destination}</h3>
                  <span className="trip-countdown">{trip.daysLeft} days left</span>
                </div>
                <p className="trip-dates">{trip.startDate} – {trip.endDate}</p>
                {trip.itineraryReady && (
                  <p className="trip-status">4-day itinerary ready</p>
                )}
                <div className="trip-actions">
                  <button className="action-btn">View Itinerary</button>
                  <button className="action-btn secondary">Edit</button>
                  <button className="action-btn icon" title="Download PDF">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 11V14C15 14.5304 14.7893 15.0391 14.4142 15.4142C14.0391 15.7893 13.5304 16 13 16H5C4.46957 16 3.96086 15.7893 3.58579 15.4142C3.21071 15.0391 3 14.5304 3 14V11M12 6L9 9M9 9L6 6M9 9V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="action-btn icon" title="Share">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M12 5C13.3807 5 14.5 3.88071 14.5 2.5C14.5 1.11929 13.3807 0 12 0C10.6193 0 9.5 1.11929 9.5 2.5C9.5 3.88071 10.6193 5 12 5Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 11C7.38071 11 8.5 9.88071 8.5 8.5C8.5 7.11929 7.38071 6 6 6C4.61929 6 3.5 7.11929 3.5 8.5C3.5 9.88071 4.61929 11 6 11Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 18C13.3807 18 14.5 16.8807 14.5 15.5C14.5 14.1193 13.3807 13 12 13C10.6193 13 9.5 14.1193 9.5 15.5C9.5 16.8807 10.6193 18 12 18Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6.5 9.5L11.5 5.5M11.5 12.5L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Smart Recommendations */}
        <section className="home-section">
          <h2 className="section-title">Smart Recommendations</h2>
          <div className="recommendations-grid">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <div className="rec-badge">{rec.type}</div>
                <h3 className="rec-name">{rec.name}</h3>
                <p className="rec-reason">{rec.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Past Trips Summary */}
        <section className="home-section">
          <h2 className="section-title">Past Trips</h2>
          <div className="past-trips-carousel">
            {pastTrips.map(trip => (
              <div key={trip.id} className="past-trip-card">
                <div className="past-trip-image">
                  <div className="trip-photo-count">{trip.photos} photos</div>
                </div>
                <div className="past-trip-info">
                  <h3 className="past-trip-destination">{trip.destination}</h3>
                  <p className="past-trip-date">{trip.date}</p>
                  <button className="plan-again-btn">Plan Again</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Quick Actions */}
        <section className="home-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Create Trip</span>
            </button>
            <button className="quick-action-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Explore Places</span>
            </button>
            <button className="quick-action-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.27002 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Search Flights</span>
            </button>
            <button className="quick-action-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Budget Planner</span>
            </button>
            <button className="quick-action-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Map View</span>
            </button>
          </div>
        </section>

        {/* 5. Weather Snapshot */}
        <section className="home-section">
          <h2 className="section-title">Weather Snapshot</h2>
          <div className="weather-grid">
            {weather.map((w, idx) => (
              <div key={idx} className="weather-card">
                <div className="weather-header">
                  <h3 className="weather-location">{w.location}</h3>
                  <div className="weather-temp">{w.temp}</div>
                </div>
                <p className="weather-condition">{w.condition}</p>
                <div className="weather-forecast">
                  {w.days.map((day, i) => (
                    <div key={i} className="weather-day">
                      <span className="day-label">{i === 0 ? 'Today' : `+${i}d`}</span>
                      <span className="day-temp">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Notifications & Reminders */}
        <section className="home-section">
          <h2 className="section-title">Notifications</h2>
          <div className="notifications-list">
            {notifications.map(notif => (
              <div key={notif.id} className="notification-item">
                <div className="notification-icon">
                  {notif.type === 'reminder' && '⏰'}
                  {notif.type === 'price' && '💰'}
                  {notif.type === 'weather' && '🌧️'}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notif.message}</p>
                  <span className="notification-time">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Saved Places & Favorites */}
        <section className="home-section">
          <h2 className="section-title">Saved Places</h2>
          <div className="saved-places-grid">
            {savedPlaces.map(place => (
              <div key={place.id} className="saved-place-card">
                <div className="place-type-badge">{place.type}</div>
                <h3 className="place-name">{place.name}</h3>
                <p className="place-location">{place.location}</p>
                <button className="add-to-itinerary-btn">Add to Itinerary</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard

