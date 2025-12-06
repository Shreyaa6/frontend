import { useState } from 'react'
import logImage from './assets/log.png'
import './login_signup.css'
import { api, tokenManager } from './api'

function LoginSignup({ onLogin, showError, showSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [signupData, setSignupData] = useState({
    email: '',
    username: '',
    password: ''
  })

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignupChange = (e) => {
    const { name, value } = e.target
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.login(loginData.email, loginData.password)
      
      if (response.success) {
        tokenManager.save(response.token)
        
        setLoginData({ email: '', password: '' })
        
        console.log('User logged in:', response.user)
        if (onLogin) {
          onLogin()
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.'
      if (showError) {
        showError(errorMessage)
      }
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.signup(
        signupData.email,
        signupData.username,
        signupData.password
      )
      
      if (response.success) {
        tokenManager.save(response.token)
        setSignupData({
          email: '',
          username: '',
          password: ''
        })
        console.log('User created:', response.user)
        if (onLogin) {
          onLogin()
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.'
      if (showError) {
        showError(errorMessage)
      }
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="background-image">
        <img src={logImage} alt="Forest background" className="bg-img" />
      </div>

      <main className="login-main">
        <div className="brand-text">Hiraeth</div>
        
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="email"
              value={loginData.email}
              onChange={handleLoginChange}
              className="form-input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="form-input"
              required
            />
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="signup-link" onClick={() => setIsLogin(false)}>
              Don't Have an Account?
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="email"
              value={signupData.email}
              onChange={handleSignupChange}
              className="form-input"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="username"
              value={signupData.username}
              onChange={handleSignupChange}
              className="form-input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="password"
              value={signupData.password}
              onChange={handleSignupChange}
              className="form-input"
              required
            />
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
            <div className="signup-link" onClick={() => setIsLogin(true)}>
              Already Have an Account? Log In
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

export default LoginSignup
