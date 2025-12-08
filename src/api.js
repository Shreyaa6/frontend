const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const handleResponse = async (response) => {
  // Parse JSON first to get the actual error message
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If response is not JSON, use status text
    const errorMessage = response.statusText || `Server error (${response.status})`;
    throw new Error(errorMessage);
  }
  
  // Check if response is ok
  if (!response.ok) {
    const errorMessage = data.message || data.error || 'An error occurred';
    throw new Error(errorMessage);
  }
  
  return data;
};

export const api = {
  signup: async (email, username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return handleResponse(response);
    } catch (error) {
      // Handle network errors (failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // RapidAPI - Flights
  searchFlights: async (departureId, arrivalId, travelClass = 'ECONOMY', adults = 1, currency = 'USD') => {
    try {
      const params = new URLSearchParams({
        departure_id: departureId,
        arrival_id: arrivalId,
        travel_class: travelClass,
        adults: adults.toString(),
        currency,
        language_code: 'en-US',
        country_code: 'US'
      });
      const response = await fetch(`${API_BASE_URL}/api/flights/search?${params}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // RapidAPI - Trains
  getTrainStations: async (hours = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trains/stations?hours=${hours}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // RapidAPI - Cars
  searchCarRentals: async (pickUpLat, pickUpLng, dropOffLat, dropOffLng, pickUpDateTime, dropOffDateTime, driverAge = 30, currency = 'USD') => {
    try {
      const params = new URLSearchParams({
        pick_up_latitude: pickUpLat.toString(),
        pick_up_longitude: pickUpLng.toString(),
        drop_off_latitude: dropOffLat.toString(),
        drop_off_longitude: dropOffLng.toString(),
        pick_up_datetime: pickUpDateTime,
        drop_off_datetime: dropOffDateTime,
        driver_age: driverAge.toString(),
        currency_code: currency,
        location: 'US'
      });
      const response = await fetch(`${API_BASE_URL}/api/cars/search?${params}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // RapidAPI - Buses
  generateBusTimetable: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/buses/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // Hotels - Free API with OpenRouter fallback
  searchHotels: async (destId, checkInDate, checkOutDate, adults = 2, currency = 'USD', cityName = '') => {
    try {
      const params = new URLSearchParams({
        dest_id: destId,
        dest_type: 'city',
        checkin_date: checkInDate,
        checkout_date: checkOutDate,
        adults_number: adults.toString(),
        room_number: '1',
        currency,
        ...(cityName && { city_name: cityName })
      });
      const response = await fetch(`${API_BASE_URL}/api/hotels/search?${params}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // Get hotel locations (for finding destination IDs)
  getHotelLocations: async (name) => {
    try {
      const params = new URLSearchParams({
        name,
        locale: 'en-us'
      });
      const response = await fetch(`${API_BASE_URL}/api/hotels/locations?${params}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },


  // RapidAPI - Weather
  getWeatherForecast: async (place, cnt = 3, units = 'standard', lang = 'en') => {
    try {
      const params = new URLSearchParams({
        place,
        cnt: cnt.toString(),
        units,
        lang
      });
      const response = await fetch(`${API_BASE_URL}/api/weather/forecast?${params}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // Exchange Rates
  getExchangeRates: async (base = 'USD') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange/rates?base=${base}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // AI Trip Planner
  generateTripPlan: async (days, destination, interests, budget, travelMode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days, destination, interests, budget, travelMode }),
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // Trip Management
  createTrip: async (tripData) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  getTrips: async () => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  getTrip: async (tripId) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  updateTrip: async (tripId, tripData) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  deleteTrip: async (tripId) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // Budget Management
  getBudgets: async () => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  getBudget: async (budgetId) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  createBudget: async (budgetData) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  updateBudget: async (budgetId, budgetData) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  deleteBudget: async (budgetId) => {
    try {
      const token = tokenManager.get();
      const response = await fetch(`${API_BASE_URL}/api/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },
};

export const tokenManager = {
  save: (token) => {
    localStorage.setItem('auth_token', token);
  },

  get: () => {
    return localStorage.getItem('auth_token');
  },

  remove: () => {
    localStorage.removeItem('auth_token');
  },
};
