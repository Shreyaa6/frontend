import { useState, useEffect } from 'react'
import Nav from './Nav'
import { api } from './api'
import './BudgetPlanner.css'

function BudgetPlanner({ onNavigate, currentPage, onLogout, showError, showSuccess }) {
  const [budget, setBudget] = useState({
    accommodation: 0,
    food: 0,
    transportation: 0,
    activities: 0,
    miscellaneous: 0
  })
  const [exchangeRates, setExchangeRates] = useState(null)
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [targetCurrency, setTargetCurrency] = useState('INR')
  const [convertedAmount, setConvertedAmount] = useState(0)

  useEffect(() => {
    loadExchangeRates()
  }, [baseCurrency])

  const loadExchangeRates = async () => {
    try {
      const response = await api.getExchangeRates(baseCurrency)
      setExchangeRates(response.data)
    } catch (error) {
      showError('Failed to load exchange rates')
    }
  }

  const handleBudgetChange = (category, value) => {
    setBudget(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }))
  }

  const calculateTotal = () => {
    return Object.values(budget).reduce((sum, val) => sum + val, 0)
  }

  const convertCurrency = () => {
    if (exchangeRates && exchangeRates.conversion_rates) {
      const rate = exchangeRates.conversion_rates[targetCurrency]
      if (rate) {
        const total = calculateTotal()
        setConvertedAmount(total * rate)
      }
    }
  }

  useEffect(() => {
    if (exchangeRates) {
      convertCurrency()
    }
  }, [budget, targetCurrency, exchangeRates])

  const total = calculateTotal()

  return (
    <div className="budget-container">
      <Nav onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
      
      <div className="budget-content">
        <div className="budget-header">
          <h1 className="budget-title">Budget Planner</h1>
          <p className="budget-subtitle">Plan and track your travel expenses</p>
        </div>

        <div className="budget-grid">
          {/* Budget Input Section */}
          <div className="budget-section">
            <h2 className="section-title">Budget Breakdown</h2>
            <div className="budget-inputs">
              {Object.entries(budget).map(([category, value]) => (
                <div key={category} className="budget-input-group">
                  <label className="budget-label">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                  <div className="input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleBudgetChange(category, e.target.value)}
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
              <div className="total-amount">${total.toFixed(2)}</div>
            </div>
          </div>

          {/* Currency Converter Section */}
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
              </div>
            </div>
          </div>
        </div>

        {/* Budget Breakdown Chart */}
        <div className="budget-section">
          <h2 className="section-title">Budget Distribution</h2>
          <div className="budget-chart">
            {Object.entries(budget).map(([category, value]) => {
              const percentage = total > 0 ? (value / total) * 100 : 0
              return (
                <div key={category} className="chart-item">
                  <div className="chart-label">
                    <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span>${value.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetPlanner

