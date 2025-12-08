import { useState, useEffect } from 'react'
import Nav from './Nav'
import { api } from './api'
import { tokenManager } from './api'
import './CreateTrip.css'

function CreateTrip({ onNavigate, currentPage, onLogout, showError, showSuccess, tripId, tripMode = 'create', destination, onTripSaved, onTripDeleted }) {
  const [step, setStep] = useState(1) // 1: Transport, 2: Hotel, 3: Review
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
  const [transportResults, setTransportResults] = useState(null)
  const [selectedTransport, setSelectedTransport] = useState(null)
  const [hotelResults, setHotelResults] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiPlan, setAiPlan] = useState(null)
  const [showAiPlan, setShowAiPlan] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loadingTrip, setLoadingTrip] = useState(false)

  // Load trip data if tripId is provided (view/edit mode)
  useEffect(() => {
    if (tripId) {
      loadTripData()
      setIsEditMode(tripMode === 'edit')
    } else {
      // Reset form when creating new trip
      setIsEditMode(false)
      setStep(1)
      setSelectedTransport(null)
      setSelectedHotel(null)
      setTransportResults(null)
      setHotelResults(null)
      
      // Pre-fill destination if provided
      if (destination) {
        setFormData(prev => ({
          ...prev,
          to: destination
        }))
      }
    }
  }, [tripId, tripMode, destination])

  const loadTripData = async () => {
    setLoadingTrip(true)
    try {
      const response = await api.getTrip(tripId)
      if (response.success && response.trip) {
        const trip = response.trip
        
        // Populate form data
        setFormData({
          to: trip.destination || '',
          from: '', // Not stored in trip
          departureDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
          returnDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
          travelers: trip.travelers || 1,
          class: 'economy',
          rooms: 1,
          guests: trip.travelers || 2,
          checkIn: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
          checkOut: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : ''
        })
        
        // Set booking type and restore selections
        if (trip.transportationType) {
          setBookingType(trip.transportationType)
        }
        if (trip.transportationData) {
          setSelectedTransport(trip.transportationData)
          // Pre-populate transport results for easier editing
          setTransportResults({
            results: [trip.transportationData]
          })
        }
        if (trip.hotelData) {
          setSelectedHotel(trip.hotelData)
          // Pre-populate hotel results for easier editing
          setHotelResults({
            results: [trip.hotelData]
          })
        }
        
        // If trip has data, go to review step (for both view and edit)
        if (trip.transportationData && trip.hotelData) {
          setStep(3)
        } else if (trip.transportationData) {
          setStep(2)
        }
      }
    } catch (error) {
      console.error('Error loading trip:', error)
      showError('Failed to load trip details')
      onNavigate('dashboard')
    } finally {
      setLoadingTrip(false)
    }
  }

  const handleDeleteTrip = async () => {
    if (!tripId) return
    
    try {
      const response = await api.deleteTrip(tripId)
      if (response.success) {
        showSuccess('Trip deleted successfully')
        if (onTripDeleted) {
          onTripDeleted()
        }
        setTimeout(() => {
          onNavigate('dashboard')
        }, 1000)
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
      showError(error.message || 'Failed to delete trip')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Step 1: Search for transportation
  const handleTransportSearch = async (e) => {
    e.preventDefault()
    
      if (!formData.from || !formData.to || !formData.departureDate) {
        showError('Please fill in all required fields')
        return
      }
      if (tripType === 'round-trip' && !formData.returnDate) {
        showError('Please select a return date')
        return
      }

    setLoading(true)
    try {
      let results = null
      
      if (bookingType === 'car') {
        const defaultLat = 40.7128
        const defaultLng = -74.0060
        const pickUpDate = new Date(formData.departureDate)
        const dropOffDate = formData.returnDate ? new Date(formData.returnDate) : new Date(formData.departureDate)
        pickUpDate.setHours(10, 0, 0, 0)
        dropOffDate.setHours(10, 0, 0, 0)
        
        const carResponse = await api.searchCarRentals(
          defaultLat, defaultLng, defaultLat, defaultLng,
          pickUpDate.toISOString(), dropOffDate.toISOString(),
          formData.travelers || 30, 'USD'
        )
        results = carResponse.data
      } else if (bookingType === 'bus') {
        const busResponse = await api.generateBusTimetable()
        results = busResponse.data
      } else if (bookingType === 'flight') {
        // For demo, create mock flight results
        // In production, use actual flight API with airport codes
        results = {
          results: [
            { id: 1, airline: 'Airline A', price: '$299', departure: '10:00 AM', arrival: '2:00 PM' },
            { id: 2, airline: 'Airline B', price: '$349', departure: '2:00 PM', arrival: '6:00 PM' },
            { id: 3, airline: 'Airline C', price: '$279', departure: '6:00 AM', arrival: '10:00 AM' }
          ]
        }
      } else if (bookingType === 'train') {
        // For demo, create mock train results
        results = {
          results: [
            { id: 1, train: 'Express Train', price: '$89', departure: '8:00 AM', arrival: '12:00 PM' },
            { id: 2, train: 'Fast Train', price: '$120', departure: '2:00 PM', arrival: '6:00 PM' }
          ]
        }
      }
      
      setTransportResults(results)
      showSuccess(`Found ${results?.results?.length || 0} ${bookingType} options!`)
    } catch (error) {
      showError(error.message || 'Failed to search for transportation')
    } finally {
      setLoading(false)
    }
  }

  // City to Booking.com Destination ID mapping (common destinations)
  const cityToDestId = {
    'new york': '-2637882',
    'nyc': '-2637882',
    'paris': '-1456928',
    'london': '-2601889',
    'tokyo': '-246227',
    'dubai': '-782831',
    'bali': '-256230',
    'goa': '-304554',
    'delhi': '-2100945',
    'mumbai': '-2090174',
    'bangkok': '-293921',
    'singapore': '-390625',
    'sydney': '-1603135',
    'los angeles': '-122590',
    'san francisco': '-1580749',
    'rome': '-126693',
    'barcelona': '-372490',
    'amsterdam': '-2140479',
    'berlin': '-1746443'
  }

  // Step 2: Search for hotels
  const handleHotelSearch = async (e) => {
    e.preventDefault()
    
    if (!formData.to || !formData.checkIn || !formData.checkOut) {
      showError('Please fill in all hotel fields')
      return
    }

    setLoading(true)
    try {
      // Get destination ID from city name (case-insensitive)
      const cityName = formData.to.toLowerCase().trim()
      const destId = cityToDestId[cityName]
      
      if (!destId) {
        showError(`Location "${formData.to}" is not supported. Please try one of the supported cities: ${Object.keys(cityToDestId).join(', ')}`)
        setLoading(false)
        return
      }

      // Format dates for API (YYYY-MM-DD)
      const checkInDate = formData.checkIn
      const checkOutDate = formData.checkOut

      const hotelResponse = await api.searchHotels(
        destId,
        checkInDate,
        checkOutDate,
        formData.guests || 2,
        'USD',
        formData.to // Pass city name for better results
      )
      
      console.log('Hotel API response:', hotelResponse)
      
      // Check if response is valid
      if (!hotelResponse || !hotelResponse.success) {
        throw new Error(hotelResponse?.message || 'Invalid response from hotels API')
      }
      
      // Parse Booking.com API response
      let hotels = []
      
      // Booking.com response structure: data.result array
      if (hotelResponse.data?.result) {
        hotels = Array.isArray(hotelResponse.data.result) 
          ? hotelResponse.data.result 
          : [hotelResponse.data.result]
      } else if (Array.isArray(hotelResponse.data)) {
        hotels = hotelResponse.data
      } else if (hotelResponse.data?.hotels) {
        hotels = Array.isArray(hotelResponse.data.hotels) 
          ? hotelResponse.data.hotels 
          : [hotelResponse.data.hotels]
      } else {
        console.log('Unexpected response structure:', hotelResponse.data)
      }
      
      // Format results for display
      const formattedHotels = hotels.slice(0, 10).map((hotel, idx) => {
        // Booking.com price structure
        const price = hotel.price_breakdown?.gross_price || 
                     hotel.price_breakdown?.all_inclusive_price ||
                     hotel.price ||
                     hotel.min_total_price ||
                     'Price on request'
        
        // Format price
        let priceDisplay = 'Price on request'
        if (typeof price === 'number') {
          priceDisplay = `$${price.toFixed(2)}`
        } else if (typeof price === 'string') {
          priceDisplay = price
        }
        
        return {
          id: hotel.hotel_id || hotel.id || idx + 1,
          name: hotel.hotel_name || hotel.name || hotel.hotel_name_trans || `Hotel ${idx + 1}`,
          price: priceDisplay,
          rating: hotel.review_score || hotel.review_score_word || hotel.rating || null,
          location: formData.to,
          image: hotel.main_photo_url || 
                hotel.photo_url || 
                hotel.images?.[0] ||
                null,
          bedrooms: hotel.room_types?.[0]?.bed_configurations?.[0]?.beds || null,
          bathrooms: hotel.room_types?.[0]?.bathrooms || null,
          address: hotel.address || hotel.hotel_address || null,
          distance: hotel.distance_to_cc || hotel.distance || null
        }
      })
      
      if (formattedHotels.length === 0) {
        setHotelResults({
          results: [
            { id: 1, name: 'No properties found', price: 'Try a different location or date', location: formData.to }
          ]
        })
        showError('No hotels found for this location. Please try a different city or check back later.')
      } else {
        setHotelResults({
          results: formattedHotels
        })
        showSuccess(`Found ${formattedHotels.length} hotel options!`)
      }
    } catch (error) {
      console.error('Hotel search error:', error)
      // Extract more detailed error message
      const errorMessage = error.message || 'Failed to search for hotels'
      showError(errorMessage)
      
      // Clear hotel results on error instead of showing error message as hotel name
      setHotelResults(null)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Create or Update trip
  const handleCreateTrip = async () => {
    if (!selectedTransport) {
      showError('Please select a transportation option')
      return
    }
    if (!selectedHotel) {
      showError('Please select a hotel')
      return
    }

    if (!tokenManager.get()) {
      showError('Please login to create a trip')
      return
    }

    setLoading(true)
    try {
      const startDate = formData.departureDate || formData.checkIn
      const endDate = formData.returnDate || formData.checkOut
      
      if (!startDate || !endDate) {
        showError('Please provide valid dates')
        setLoading(false)
        return
      }
      
      const tripData = {
        destination: formData.to,
        transportationType: bookingType,
        transportationData: selectedTransport,
        hotelData: selectedHotel,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        travelers: formData.travelers || 1
      }

      if (isEditMode && tripId) {
        // Update existing trip
        console.log('Updating trip with data:', tripData)
        const response = await api.updateTrip(tripId, tripData)
        console.log('Trip updated:', response)
        showSuccess('Trip updated successfully!')
        
        if (onTripSaved) {
          onTripSaved()
        }
      } else {
        // Create new trip
        console.log('Creating trip with data:', tripData)
        const response = await api.createTrip(tripData)
        console.log('Trip created:', response)
        showSuccess('Trip created successfully! Check your dashboard.')
      }
      
      // Reset form and go to dashboard
      setTimeout(() => {
        onNavigate('dashboard')
        // Refresh trips list if callback provided
        if (onTripSaved) {
          onTripSaved()
        }
      }, 1500)
    } catch (error) {
      console.error(isEditMode ? 'Update trip error:' : 'Create trip error:', error)
      const errorMessage = error.message || (isEditMode ? 'Failed to update trip' : 'Failed to create trip')
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }))
  }

  // AI Trip Planner
  const handleGenerateAiPlan = async () => {
    if (!formData.to) {
      showError('Please enter a destination first')
      return
    }

    setAiLoading(true)
    try {
      const duration = tripType === 'round-trip' && formData.returnDate && formData.departureDate
        ? Math.ceil((new Date(formData.returnDate) - new Date(formData.departureDate)) / (1000 * 60 * 60 * 24))
        : 3

      const interests = []
      if (bookingType === 'flight') interests.push('exploration', 'culture')
      if (bookingType === 'train' || bookingType === 'bus') interests.push('scenic', 'local experience')
      if (bookingType === 'car') interests.push('road trip', 'flexibility')

      const aiResponse = await api.generateTripPlan(
        duration,
        formData.to,
        interests.length > 0 ? interests : ['fine dining', 'cuisine'],
        'medium',
        bookingType === 'car' ? 'car' : 'public transport'
      )

      setAiPlan(aiResponse.data)
      setShowAiPlan(true)
      showSuccess('AI trip plan generated!')
    } catch (error) {
      console.error('AI plan error:', error)
      showError(error.message || 'Failed to generate AI trip plan')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="create-trip-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
      
      <div className="create-trip-content">
        <div className="trip-header">
          <h1 className="trip-title">
            {loadingTrip ? 'Loading...' : tripMode === 'view' ? 'Trip Details' : isEditMode ? 'Edit Trip' : 'Plan Your Journey'}
          </h1>
          <p className="trip-subtitle">
            {loadingTrip ? 'Loading trip details...' : (
              <>
                {step === 1 && (tripMode === 'view' ? 'View Transportation Details' : 'Step 1: Choose your transportation')}
                {step === 2 && (tripMode === 'view' ? 'View Hotel Details' : 'Step 2: Select your hotel')}
                {step === 3 && (
                  tripMode === 'view' ? 'Trip Summary' : 
                  isEditMode ? 'Step 3: Review and update trip' : 
                  'Step 3: Review and create trip'
                )}
              </>
            )}
          </p>
          {step === 1 && formData.to && tripMode !== 'view' && (
            <button 
              className="ai-plan-btn" 
              onClick={handleGenerateAiPlan}
              disabled={aiLoading}
            >
              {aiLoading ? '✨ Generating AI Plan...' : '✨ Use AI to Plan My Trip'}
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Transport</div>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Hotel</div>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Create</div>
          </div>
        </div>

        {/* Step 1: Transportation */}
        {step === 1 && (
          <div className="step-content">
        <div className="booking-type-selector">
          <button
            className={`booking-type-btn ${bookingType === 'flight' ? 'active' : ''}`}
            onClick={() => tripMode !== 'view' && setBookingType('flight')}
            disabled={tripMode === 'view'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 13L10 18L18 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10L10 15L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Flight
          </button>
          <button
            className={`booking-type-btn ${bookingType === 'train' ? 'active' : ''}`}
            onClick={() => tripMode !== 'view' && setBookingType('train')}
            disabled={tripMode === 'view'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17C17.5523 5 18 5.44772 18 6V14C18 14.5523 17.5523 15 17 15H3C2.44772 15 2 14.5523 2 14V6C2 5.44772 2.44772 5 3 5Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Train
          </button>
          <button
            className={`booking-type-btn ${bookingType === 'bus' ? 'active' : ''}`}
            onClick={() => tripMode !== 'view' && setBookingType('bus')}
            disabled={tripMode === 'view'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H16C17.1046 4 18 4.89543 18 6V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Bus
          </button>
          <button
            className={`booking-type-btn ${bookingType === 'car' ? 'active' : ''}`}
            onClick={() => tripMode !== 'view' && setBookingType('car')}
            disabled={tripMode === 'view'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 8L5 6H15L17 8M3 8V15C3 15.5523 3.44772 16 4 16H5C5.55228 16 6 15.5523 6 15V14H14V15C14 15.5523 14.4477 16 15 16H16C16.5523 16 17 15.5523 17 15V8M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Car
          </button>
        </div>

            <form className="trip-search-form" onSubmit={handleTransportSearch}>
              {bookingType !== 'car' && (
            <div className="trip-type-selector">
                  <button 
                    type="button" 
                    className={`trip-type-btn ${tripType === 'one-way' ? 'active' : ''}`} 
                    onClick={() => tripMode !== 'view' && setTripType('one-way')}
                    disabled={tripMode === 'view'}
                  >
                One Way
              </button>
                  <button 
                    type="button" 
                    className={`trip-type-btn ${tripType === 'round-trip' ? 'active' : ''}`} 
                    onClick={() => tripMode !== 'view' && setTripType('round-trip')}
                    disabled={tripMode === 'view'}
                  >
                Round Trip
              </button>
            </div>
          )}
          
          <div className="search-form-grid">
                <div className="form-field">
                  <label className="field-label">From</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      name="from" 
                      placeholder="Enter city or airport" 
                      value={formData.from} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                  </div>
                </div>
                {bookingType !== 'car' && tripMode !== 'view' && (
                  <button type="button" className="swap-btn" onClick={swapLocations}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                <div className="form-field">
                  <label className="field-label">To</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      name="to" 
                      placeholder="Enter city or airport" 
                      value={formData.to} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="field-label">Departure</label>
                  <div className="input-wrapper">
                    <input 
                      type="date" 
                      name="departureDate" 
                      value={formData.departureDate} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                  </div>
                </div>
                {tripType === 'round-trip' && bookingType !== 'car' && (
                  <div className="form-field">
                    <label className="field-label">Return</label>
                    <div className="input-wrapper">
                      <input 
                        type="date" 
                        name="returnDate" 
                        value={formData.returnDate} 
                        onChange={handleInputChange} 
                        className="form-input" 
                        required 
                        disabled={tripMode === 'view'}
                        readOnly={tripMode === 'view'}
                      />
                    </div>
                  </div>
                )}
                {bookingType === 'car' && (
                  <div className="form-field">
                    <label className="field-label">Drop-off Date</label>
                    <div className="input-wrapper">
                      <input 
                        type="date" 
                        name="returnDate" 
                        value={formData.returnDate} 
                        onChange={handleInputChange} 
                        className="form-input" 
                        required 
                        disabled={tripMode === 'view'}
                        readOnly={tripMode === 'view'}
                      />
                    </div>
                  </div>
                )}
                <div className="form-field">
                  <label className="field-label">Travelers</label>
                  <div className="input-wrapper">
                    <input 
                      type="number" 
                      name="travelers" 
                      min="1" 
                      max="9" 
                      value={formData.travelers} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                  </div>
                </div>
              </div>

              {tripMode !== 'view' && (
                <button type="submit" className="search-btn" disabled={loading}>
                  <span>{loading ? 'Searching...' : 'Search'}</span>
                </button>
              )}
            </form>

            {/* AI Trip Plan */}
            {showAiPlan && aiPlan && (
              <div className="ai-plan-section">
                <div className="ai-plan-header">
                  <h3 className="ai-plan-title">✨ AI Trip Plan for {formData.to}</h3>
                  <button className="close-ai-btn" onClick={() => setShowAiPlan(false)}>×</button>
                </div>
                <div className="ai-plan-content">
                  {aiPlan.itinerary && (
                    <div className="ai-plan-day">
                      <h4>Itinerary</h4>
                      {Array.isArray(aiPlan.itinerary) ? (
                        aiPlan.itinerary.map((day, idx) => (
                          <div key={idx} className="ai-day-card">
                            <h5>Day {day.day || idx + 1}</h5>
                            {day.activities && (
                              <div>
                                <strong>Activities:</strong>
                                <ul>
                                  {day.activities.map((activity, aIdx) => (
                                    <li key={aIdx}>{activity}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {day.places && (
                              <div>
                                <strong>Places:</strong>
                                <ul>
                                  {day.places.map((place, pIdx) => (
                                    <li key={pIdx}>{place}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="ai-plan-text">{JSON.stringify(aiPlan.itinerary, null, 2)}</div>
                      )}
                    </div>
                  )}
                  {aiPlan.budget && (
                    <div className="ai-plan-budget">
                      <h4>Budget Breakdown</h4>
                      <div className="budget-grid">
                        {Object.entries(aiPlan.budget).map(([key, value]) => (
                          <div key={key} className="budget-item">
                            <span className="budget-label">{key}:</span>
                            <span className="budget-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiPlan.tips && Array.isArray(aiPlan.tips) && (
                    <div className="ai-plan-tips">
                      <h4>Travel Tips</h4>
                      <ul>
                        {aiPlan.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {typeof aiPlan === 'string' && (
                    <div className="ai-plan-text">{aiPlan}</div>
                  )}
                </div>
              </div>
            )}

            {/* Transport Results */}
            {transportResults && (
              <div className="results-section">
                <h3 className="results-title">Select Your {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</h3>
                <div className="results-grid">
                  {(transportResults.results || []).map((option, idx) => (
                    <div
                      key={option.id || idx}
                      className={`result-card ${selectedTransport?.id === option.id ? 'selected' : ''} ${tripMode === 'view' ? 'read-only' : ''}`}
                      onClick={() => tripMode !== 'view' && setSelectedTransport(option)}
                      style={{ cursor: tripMode === 'view' ? 'default' : 'pointer' }}
                    >
                      <div className="result-content">
                        <h4>{option.airline || option.train || option.name || `${bookingType} Option ${idx + 1}`}</h4>
                        <p className="result-price">{option.price || 'Price on request'}</p>
                        {(option.departure || option.pickUpTime) && (
                          <p className="result-time">{option.departure || option.pickUpTime} - {option.arrival || option.dropOffTime}</p>
                        )}
                      </div>
                      {selectedTransport?.id === option.id && (
                        <div className="selected-badge">✓ Selected</div>
                      )}
                    </div>
                  ))}
                  </div>
                {selectedTransport && tripMode !== 'view' && (
                  <button className="continue-btn" onClick={() => setStep(2)}>
                    Continue to Hotel Selection →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Hotel */}
        {step === 2 && (
          <div className="step-content">
            {tripMode !== 'view' && (
              <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
            )}
            
            <form className="trip-search-form" onSubmit={handleHotelSearch}>
              <div className="search-form-grid">
                <div className="form-field">
                  <label className="field-label">City or Hotel</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      name="to" 
                      placeholder="Enter city or hotel name" 
                      value={formData.to} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="field-label">Check-in</label>
                  <div className="input-wrapper">
                    <input 
                      type="date" 
                      name="checkIn" 
                      value={formData.checkIn} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Check-out</label>
                    <div className="input-wrapper">
                    <input 
                      type="date" 
                      name="checkOut" 
                      value={formData.checkOut} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Rooms</label>
                    <div className="input-wrapper">
                    <input 
                      type="number" 
                      name="rooms" 
                      min="1" 
                      max="5" 
                      value={formData.rooms} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Guests</label>
                    <div className="input-wrapper">
                    <input 
                      type="number" 
                      name="guests" 
                      min="1" 
                      max="10" 
                      value={formData.guests} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      required 
                      disabled={tripMode === 'view'}
                      readOnly={tripMode === 'view'}
                    />
                  </div>
                </div>
              </div>

              {tripMode !== 'view' && (
                <button type="submit" className="search-btn" disabled={loading}>
                  <span>{loading ? 'Searching...' : 'Search Hotels'}</span>
                </button>
              )}
        </form>

            {/* Hotel Results */}
            {hotelResults && (
              <div className="results-section">
                <h3 className="results-title">Select Your Hotel</h3>
                <div className="results-grid">
                  {(hotelResults.results || []).map((hotel, idx) => (
                    <div
                      key={hotel.id || idx}
                      className={`result-card ${selectedHotel?.id === hotel.id ? 'selected' : ''} ${tripMode === 'view' ? 'read-only' : ''}`}
                      onClick={() => tripMode !== 'view' && setSelectedHotel(hotel)}
                      style={{ cursor: tripMode === 'view' ? 'default' : 'pointer' }}
                    >
                      {hotel.image && (
                        <div className="result-image" style={{ backgroundImage: `url(${hotel.image})` }}></div>
                      )}
                      <div className="result-content">
                        <h4>{hotel.name}</h4>
                        <p className="result-price">{hotel.price}</p>
                        {hotel.rating && <p className="result-rating">⭐ {hotel.rating}</p>}
                        {hotel.bedrooms && <p className="result-details">{hotel.bedrooms} bedrooms • {hotel.bathrooms || 'N/A'} bathrooms</p>}
                        {hotel.location && <p className="result-location">{hotel.location}</p>}
                      </div>
                      {selectedHotel?.id === hotel.id && (
                        <div className="selected-badge">✓ Selected</div>
                      )}
                    </div>
                  ))}
                </div>
                {selectedHotel && tripMode !== 'view' && (
                  <button className="continue-btn" onClick={() => setStep(3)}>
                    Review & Create Trip →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review and Create/Update/View */}
        {step === 3 && (
          <div className="step-content">
            {tripMode !== 'view' && (
              <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
            )}
            
            <div className="review-section">
              <h3 className="review-title">
                {tripMode === 'view' ? 'Trip Details' : 'Review Your Trip'}
              </h3>
              
              <div className="review-card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4>Transportation</h4>
                  {isEditMode && (
                    <button 
                      className="action-btn secondary" 
                      onClick={() => setStep(1)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Change
                    </button>
                  )}
                </div>
                <p><strong>Type:</strong> {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</p>
                {formData.from && <p><strong>From:</strong> {formData.from}</p>}
                <p><strong>To:</strong> {formData.to}</p>
                <p><strong>Selected:</strong> {selectedTransport?.airline || selectedTransport?.train || selectedTransport?.name || 'Selected option'}</p>
                <p><strong>Price:</strong> {selectedTransport?.price || 'N/A'}</p>
              </div>

              <div className="review-card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4>Hotel</h4>
                  {isEditMode && (
                    <button 
                      className="action-btn secondary" 
                      onClick={() => setStep(2)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Change
                    </button>
                  )}
                </div>
                <p><strong>Hotel:</strong> {selectedHotel?.name || 'Not selected'}</p>
                <p><strong>Location:</strong> {formData.to}</p>
                <p><strong>Check-in:</strong> {formData.checkIn}</p>
                <p><strong>Check-out:</strong> {formData.checkOut}</p>
                <p><strong>Price:</strong> {selectedHotel?.price || 'N/A'}</p>
              </div>

              <div className="review-card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4>Trip Details</h4>
                  {isEditMode && (
                    <button 
                      className="action-btn secondary" 
                      onClick={() => {
                        // Allow editing basic details inline or go to step 1
                        const newTravelers = prompt('Enter number of travelers:', formData.travelers)
                        if (newTravelers && !isNaN(newTravelers) && parseInt(newTravelers) > 0) {
                          setFormData(prev => ({ ...prev, travelers: parseInt(newTravelers) }))
                        }
                      }}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                  )}
                </div>
                <p><strong>Destination:</strong> {formData.to}</p>
                <p><strong>Travelers:</strong> {formData.travelers}</p>
                <p><strong>Start Date:</strong> {formData.departureDate || formData.checkIn}</p>
                <p><strong>End Date:</strong> {formData.returnDate || formData.checkOut}</p>
              </div>

              {tripMode === 'view' ? (
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button 
                    className="create-trip-btn" 
                    onClick={() => onNavigate('create-trip', tripId, 'edit')}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Edit Trip
                  </button>
                  <button 
                    className="action-btn secondary" 
                    onClick={() => onNavigate('dashboard')}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button className="create-trip-btn" onClick={handleCreateTrip} disabled={loading || loadingTrip} style={{ flex: 1, minWidth: '150px' }}>
                    {loading ? (isEditMode ? 'Updating Trip...' : 'Creating Trip...') : (isEditMode ? 'Update Trip' : 'Create Trip')}
                  </button>
                  {isEditMode && (
                    <button 
                      className="action-btn secondary" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
                          handleDeleteTrip()
                        }
                      }}
                      style={{ 
                        background: '#e74c3c', 
                        color: '#fff',
                        border: 'none',
                        minWidth: '120px'
                      }}
                    >
                      Delete Trip
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default CreateTrip
