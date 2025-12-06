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

  // Gemini AI API
  geminiChat: async (message, history = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  geminiGenerateText: async (prompt) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  geminiTripSuggestions: async (destination, duration, budget, interests) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/trip-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination, duration, budget, interests }),
      });
      return handleResponse(response);
    } catch (error) {
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

  // RapidAPI - Hotels
  searchHotels: async (placeId, adults = 1, currency = 'USD') => {
    try {
      const params = new URLSearchParams({
        placeId,
        adults: adults.toString(),
        currency
      });
      const response = await fetch(`${API_BASE_URL}/api/hotels/airbnb?${params}`);
      return handleResponse(response);
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please make sure the backend server is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },

  // RapidAPI - Places/Restaurants
  searchRestaurants: async (locationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/places/restaurants?locationId=${locationId}`);
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
