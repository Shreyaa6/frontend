import { useState, useEffect } from 'react'
import Nav from './Nav'
import { api } from './api'
import './BudgetPlanner.css'

function BudgetPlanner({ onNavigate, currentPage, onLogout, showError, showSuccess }) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formData, setFormData] = useState({
    name: 'My Budget',
    accommodation: 0,
    food: 0,
    transportation: 0,
    activities: 0,
    miscellaneous: 0,
    currency: 'USD',
    tripId: null
  })
  const [exchangeRates, setExchangeRates] = useState(null)
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [targetCurrency, setTargetCurrency] = useState('INR')
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [trips, setTrips] = useState([])

  useEffect(() => {
    fetchBudgets()
    fetchTrips()
  }, [])

  useEffect(() => {
    loadExchangeRates()
  }, [baseCurrency])

  useEffect(() => {
    if (exchangeRates && baseCurrency) {
      loadExchangeRates()
    }
  }, [baseCurrency])

  useEffect(() => {
    if (exchangeRates) {
      convertCurrency()
    }
  }, [formData, targetCurrency, exchangeRates, baseCurrency])

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const response = await api.getBudgets()
      if (response.success && response.budgets) {
        setBudgets(response.budgets)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
      showError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrips = async () => {
    try {
      const response = await api.getTrips()
      if (response.success && response.trips) {
        setTrips(response.trips)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    }
  }

  const loadExchangeRates = async () => {
    try {
      const response = await api.getExchangeRates(baseCurrency)
      setExchangeRates(response.data)
    } catch (error) {
      showError('Failed to load exchange rates')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tripId' ? (value === '' ? null : parseInt(value)) : 
              ['accommodation', 'food', 'transportation', 'activities', 'miscellaneous'].includes(name) 
                ? parseFloat(value) || 0 
                : value
    }))
  }

  const calculateTotal = (budget = formData) => {
    return (budget.accommodation || 0) + 
           (budget.food || 0) + 
           (budget.transportation || 0) + 
           (budget.activities || 0) + 
           (budget.miscellaneous || 0)
  }

  const convertCurrency = () => {
    if (exchangeRates && exchangeRates.conversion_rates) {
      const rate = exchangeRates.conversion_rates[targetCurrency]
      if (rate) {
        const total = showForm ? calculateTotal() : (budgets.length > 0 ? budgets.reduce((sum, b) => sum + calculateTotal(b), 0) : 0)
        setConvertedAmount(total * rate)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingBudget) {
        const response = await api.updateBudget(editingBudget.id, formData)
        if (response.success) {
          showSuccess('Budget updated successfully!')
          setShowForm(false)
          setEditingBudget(null)
          resetForm()
          fetchBudgets()
        }
      } else {
        const response = await api.createBudget(formData)
        if (response.success) {
          showSuccess('Budget created successfully!')
          setShowForm(false)
          resetForm()
          fetchBudgets()
        }
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      showError(error.message || 'Failed to save budget')
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      name: budget.name || 'My Budget',
      accommodation: budget.accommodation || 0,
      food: budget.food || 0,
      transportation: budget.transportation || 0,
      activities: budget.activities || 0,
      miscellaneous: budget.miscellaneous || 0,
      currency: budget.currency || 'USD',
      tripId: budget.tripId || null
    })
    setShowForm(true)
  }

  const handleDelete = async (budgetId, budgetName) => {
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

  const resetForm = () => {
    setFormData({
      name: 'My Budget',
      accommodation: 0,
      food: 0,
      transportation: 0,
      activities: 0,
      miscellaneous: 0,
      currency: 'USD',
      tripId: null
    })
    setEditingBudget(null)
  }

  const handleNewBudget = () => {
    resetForm()
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
    resetForm()
  }

  const total = calculateTotal()

  return (
    <div className="budget-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
      
      <div className="budget-content">
        <div className="budget-header">
          <h1 className="budget-title">Budget Planner</h1>
          <p className="budget-subtitle">Plan and track your travel expenses</p>
        </div>

        {!showForm ? (
          <>
            {/* Budgets List */}
            <div className="budget-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 className="section-title">My Budgets</h2>
                <button className="create-budget-btn" onClick={handleNewBudget}>
                  + Create New Budget
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>Loading budgets...</div>
              ) : budgets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#565449' }}>
                  <p>No budgets yet. Create your first budget to get started!</p>
                  <button className="create-budget-btn" onClick={handleNewBudget} style={{ marginTop: '20px' }}>
                    Create Your First Budget
                  </button>
                </div>
              ) : (
                <div className="budgets-grid">
                  {budgets.map(budget => {
                    const budgetTotal = calculateTotal(budget)
                    return (
                      <div key={budget.id} className="budget-card">
                        <div className="budget-card-header">
                          <h3 className="budget-card-title">{budget.name}</h3>
                          {budget.trip && (
                            <span className="budget-trip-badge">
                              {budget.trip.destination}
                            </span>
                          )}
                        </div>
                        <div className="budget-card-total">
                          <span className="budget-card-currency">{budget.currency || 'USD'}</span>
                          <span className="budget-card-amount">{budgetTotal.toFixed(2)}</span>
                        </div>
                        <div className="budget-card-breakdown">
                          <div className="breakdown-item">
                            <span>Accommodation</span>
                            <span>{budget.currency || 'USD'} {(budget.accommodation || 0).toFixed(2)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Food</span>
                            <span>{budget.currency || 'USD'} {(budget.food || 0).toFixed(2)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Transportation</span>
                            <span>{budget.currency || 'USD'} {(budget.transportation || 0).toFixed(2)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Activities</span>
                            <span>{budget.currency || 'USD'} {(budget.activities || 0).toFixed(2)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Miscellaneous</span>
                            <span>{budget.currency || 'USD'} {(budget.miscellaneous || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="budget-card-actions">
                          <button className="action-btn" onClick={() => handleEdit(budget)}>Edit</button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDelete(budget.id, budget.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Currency Converter */}
            <div className="budget-section">
              <h2 className="section-title">Currency Converter</h2>
              <div className="converter-container">
                <div className="currency-selector">
                  <label className="currency-label">From</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="currency-select"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div className="currency-selector">
                  <label className="currency-label">To</label>
                  <select
                    value={targetCurrency}
                    onChange={(e) => setTargetCurrency(e.target.value)}
                    className="currency-select"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div className="conversion-result">
                  <div className="conversion-label">Converted Amount</div>
                  <div className="conversion-amount">
                    {convertedAmount.toFixed(2)} {targetCurrency}
                  </div>
                  {exchangeRates && exchangeRates.conversion_rates && (
                    <div className="exchange-rate">
                      1 {baseCurrency} = {exchangeRates.conversion_rates[targetCurrency]?.toFixed(4)} {targetCurrency}
                    </div>
                  )}
                  {budgets.length > 0 && (
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#565449' }}>
                      Converting total of all budgets
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Budget Form */
          <div className="budget-section">
            <h2 className="section-title">{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h2>
            
            <form onSubmit={handleSubmit} className="budget-form">
              <div className="form-group">
                <label className="form-label">Budget Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="My Budget"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link to Trip (Optional)</label>
                <select
                  name="tripId"
                  value={formData.tripId || ''}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">No trip linked</option>
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      {trip.destination} ({new Date(trip.startDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>

              <div className="budget-inputs">
                {['accommodation', 'food', 'transportation', 'activities', 'miscellaneous'].map(category => (
                  <div key={category} className="budget-input-group">
                    <label className="budget-label">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </label>
                    <div className="input-wrapper">
                      <span className="currency-symbol">{formData.currency || 'USD'}</span>
                      <input
                        type="number"
                        name={category}
                        value={formData[category]}
                        onChange={handleInputChange}
                        className="budget-input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="budget-total">
                <div className="total-label">Total Budget</div>
                <div className="total-amount">{formData.currency || 'USD'} {total.toFixed(2)}</div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetPlanner
