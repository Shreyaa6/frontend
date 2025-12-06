import { useState } from 'react'
import Nav from './Nav'
import { api } from './api'
import './CreateTrip.css'

function CreateTrip({ onNavigate, currentPage, onLogout, showError, showSuccess }) {
  const [bookingType, setBookingType] = useState('flight')
  const [tripType, setTripType] = useState('round-trip')
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
    class: 'economy',
    rooms: 1,
    guests: 2,
    checkIn: '',
    checkOut: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form based on booking type
    if (bookingType === 'hotel') {
      if (!formData.to || !formData.checkIn || !formData.checkOut) {
        showError('Please fill in all required fields')
        return
      }
    } else {
      if (!formData.from || !formData.to || !formData.departureDate) {
        showError('Please fill in all required fields')
        return
      }
      if (tripType === 'round-trip' && !formData.returnDate) {
        showError('Please select a return date')
        return
      }
    }

    try {
      // Get Gemini trip suggestions
      const destination = bookingType === 'hotel' ? formData.to : formData.to
      const duration = bookingType === 'hotel' 
        ? Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))
        : tripType === 'round-trip'
        ? Math.ceil((new Date(formData.returnDate) - new Date(formData.departureDate)) / (1000 * 60 * 60 * 24))
        : 1

      const interests = []
      if (bookingType === 'hotel') interests.push('accommodation', 'relaxation')
      if (bookingType === 'flight') interests.push('exploration', 'culture')
      if (bookingType === 'train' || bookingType === 'bus') interests.push('scenic', 'local experience')
      if (bookingType === 'car') interests.push('road trip', 'flexibility')

      const geminiResponse = await api.geminiTripSuggestions(
        destination,
        duration,
        'medium',
        interests
      )

      showSuccess(`Trip suggestions generated for ${destination}! Check the Explore page for details.`)
      
      // You can store the suggestions or navigate to explore page
      // For now, just show success message
    } catch (error) {
      showError(error.message || 'Failed to generate trip suggestions')
    }
  }

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }))
  }

  return (
    <div className="create-trip-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
      
      <div className="create-trip-content">
        <div className="trip-header">
          <h1 className="trip-title">Plan Your Journey</h1>
          <p className="trip-subtitle">Where would you like to go?</p>
        </div>

        {/* Booking Type Selector */}
        <div className="booking-type-selector">
          <button
            className={`booking-type-btn ${bookingType === 'flight' ? 'active' : ''}`}
            onClick={() => setBookingType('flight')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 13L10 18L18 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10L10 15L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Flight
          </button>
          <button
            className={`booking-type-btn ${bookingType === 'hotel' ? 'active' : ''}`}
            onClick={() => setBookingType('hotel')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 4H18C18.5523 4 19 4.44772 19 5V17C19 17.5523 18.5523 18 18 18H2C1.44772 18 1 17.5523 1 17V5C1 4.44772 1.44772 4 2 4Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M1 8H19" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 12H7M13 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Hotel
          </button>
          <button
            className={`booking-type-btn ${bookingType === 'train' ? 'active' : ''}`}
            onClick={() => setBookingType('train')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17C17.5523 5 18 5.44772 18 6V14C18 14.5523 17.5523 15 17 15H3C2.44772 15 2 14.5523 2 14V6C2 5.44772 2.44772 5 3 5Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 5V2M14 5V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Train
          </button>
          <button
            className={`booking-type-btn ${bookingType === 'bus' ? 'active' : ''}`}
            onClick={() => setBookingType('bus')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H16C17.1046 4 18 4.89543 18 6V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="5" cy="14" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="14" r="1.5" fill="currentColor"/>
            </svg>
            Bus
          </button>
          <button
            className={`booking-type-btn ${bookingType === 'car' ? 'active' : ''}`}
            onClick={() => setBookingType('car')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 8L5 6H15L17 8M3 8V15C3 15.5523 3.44772 16 4 16H5C5.55228 16 6 15.5523 6 15V14H14V15C14 15.5523 14.4477 16 15 16H16C16.5523 16 17 15.5523 17 15V8M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="15" r="1.5" fill="currentColor"/>
              <circle cx="14" cy="15" r="1.5" fill="currentColor"/>
            </svg>
            Car
          </button>
        </div>

        {/* Main Search Form */}
        <form className="trip-search-form" onSubmit={handleSubmit}>
          {/* Trip Type Selector (only for transport types) */}
          {bookingType !== 'hotel' && (
            <div className="trip-type-selector">
              <button
                type="button"
                className={`trip-type-btn ${tripType === 'one-way' ? 'active' : ''}`}
                onClick={() => setTripType('one-way')}
              >
                One Way
              </button>
              <button
                type="button"
                className={`trip-type-btn ${tripType === 'round-trip' ? 'active' : ''}`}
                onClick={() => setTripType('round-trip')}
              >
                Round Trip
              </button>
            </div>
          )}
          
          <div className="search-form-grid">
            {bookingType === 'hotel' ? (
              <>
                {/* Hotel Location */}
                <div className="form-field">
                  <label className="field-label">City or Hotel</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M3.33331 8.33333C3.33331 13.3333 10 18.3333 10 18.3333C10 18.3333 16.6666 13.3333 16.6666 8.33333C16.6666 6.44928 15.8774 4.64144 14.4406 3.2046C13.0038 1.76777 11.196 0.978577 9.31198 0.978577C7.42793 0.978577 5.62009 1.76777 4.18325 3.2046C2.74641 4.64144 1.95722 6.44928 1.95722 8.33333H3.33331Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <input
                      type="text"
                      name="to"
                      placeholder="Enter city or hotel name"
                      value={formData.to}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Check-in Date */}
                <div className="form-field">
                  <label className="field-label">Check-in</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="form-field">
                  <label className="field-label">Check-out</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Rooms */}
                <div className="form-field">
                  <label className="field-label">Rooms</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2 4H18C18.5523 4 19 4.44772 19 5V17C19 17.5523 18.5523 18 18 18H2C1.44772 18 1 17.5523 1 17V5C1 4.44772 1.44772 4 2 4Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <input
                      type="number"
                      name="rooms"
                      min="1"
                      max="5"
                      value={formData.rooms}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="form-field">
                  <label className="field-label">Guests</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M10 12C5.58172 12 2 14.2386 2 17V20H18V17C18 14.2386 14.4183 12 10 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <input
                      type="number"
                      name="guests"
                      min="1"
                      max="10"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* From Location */}
                <div className="form-field">
                  <label className="field-label">From</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M3.33331 8.33333C3.33331 13.3333 10 18.3333 10 18.3333C10 18.3333 16.6666 13.3333 16.6666 8.33333C16.6666 6.44928 15.8774 4.64144 14.4406 3.2046C13.0038 1.76777 11.196 0.978577 9.31198 0.978577C7.42793 0.978577 5.62009 1.76777 4.18325 3.2046C2.74641 4.64144 1.95722 6.44928 1.95722 8.33333H3.33331Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <input
                      type="text"
                      name="from"
                      placeholder={bookingType === 'car' ? 'Pick-up location' : bookingType === 'train' ? 'From station' : bookingType === 'bus' ? 'From station' : 'Enter city or airport'}
                      value={formData.from}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Swap Button */}
                {bookingType !== 'car' && (
                  <button type="button" className="swap-btn" onClick={swapLocations} title="Swap locations">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}

                {/* To Location */}
                <div className="form-field">
                  <label className="field-label">To</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M3.33331 8.33333C3.33331 13.3333 10 18.3333 10 18.3333C10 18.3333 16.6666 13.3333 16.6666 8.33333C16.6666 6.44928 15.8774 4.64144 14.4406 3.2046C13.0038 1.76777 11.196 0.978577 9.31198 0.978577C7.42793 0.978577 5.62009 1.76777 4.18325 3.2046C2.74641 4.64144 1.95722 6.44928 1.95722 8.33333H3.33331Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <input
                      type="text"
                      name="to"
                      placeholder={bookingType === 'car' ? 'Drop-off location' : bookingType === 'train' ? 'To station' : bookingType === 'bus' ? 'To station' : 'Enter city or airport'}
                      value={formData.to}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Departure Date */}
                <div className="form-field">
                  <label className="field-label">{bookingType === 'car' ? 'Pick-up Date' : 'Departure'}</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Return Date (only for round trip) */}
                {tripType === 'round-trip' && bookingType !== 'car' && (
                  <div className="form-field">
                    <label className="field-label">Return</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Car Drop-off Date */}
                {bookingType === 'car' && (
                  <div className="form-field">
                    <label className="field-label">Drop-off Date</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V17C17 18.1046 16.1046 19 15 19H5C3.89543 19 3 18.1046 3 17V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Travelers/Passengers */}
                <div className="form-field">
                  <label className="field-label">{bookingType === 'car' ? 'Passengers' : 'Travelers'}</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M10 12C5.58172 12 2 14.2386 2 17V20H18V17C18 14.2386 14.4183 12 10 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <input
                      type="number"
                      name="travelers"
                      min="1"
                      max="9"
                      value={formData.travelers}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Class (only for flight and train) */}
                {(bookingType === 'flight' || bookingType === 'train') && (
                  <div className="form-field">
                    <label className="field-label">Class</label>
                    <div className="input-wrapper">
                      <select
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        className="form-input form-select"
                      >
                        <option value="economy">Economy</option>
                        <option value="premium-economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="search-btn">
            <span>Search</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        {/* Popular Destinations */}
        <div className="popular-destinations">
          <h2 className="section-title">Popular Destinations</h2>
          <div className="destinations-grid">
            {[
              { name: 'Goa', country: 'India', image: '🏖️' },
              { name: 'Paris', country: 'France', image: '🗼' },
              { name: 'Tokyo', country: 'Japan', image: '🗾' },
              { name: 'Bali', country: 'Indonesia', image: '🌴' },
              { name: 'Dubai', country: 'UAE', image: '🏙️' },
              { name: 'New York', country: 'USA', image: '🗽' }
            ].map((dest, idx) => (
              <div key={idx} className="destination-card" onClick={() => {
                setFormData(prev => ({ ...prev, to: dest.name }))
              }}>
                <div className="destination-emoji">{dest.image}</div>
                <div className="destination-info">
                  <h3 className="destination-name">{dest.name}</h3>
                  <p className="destination-country">{dest.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTrip

