import React, { useState } from 'react'
import { Container, Row, Col, Form, FormControl, FormCheck, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../../components'
import { APP_NAME, APP_SUBTITLE, APP_TAGLINE, FOOTER_TEXT, LOGO_ALT_TEXT, BRAND_NAME, BRAND_URL } from '../../constants/app'
import logoImg from '../../assets/logo/logo-transprant.png'
import bgLoginImg from '../../assets/bg_login.avif'
import '../../styles/auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { success, error, warning } = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation - consistent with project standards
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation - consistent with project standards
    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password.trim(),
        remember: formData.remember
      })
      
      if (result.success) {
        success('Login successful! Welcome back.', {
          title: 'Welcome!',
          duration: 3000
        })
        
        // Redirect to dashboard immediately
        navigate('/dashboard')
      }
    } catch (err) {
      // Handle different types of login errors with appropriate toast types
      const errorMessage = err.message || 'Login failed. Please try again.'
      
      if (err.message === 'Invalid email or password' || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        warning(
          `Invalid email or password. Backend rejected these credentials.\n\n` +
          `Email: ${formData.email}\n` +
          `Backend: ${backendUrl}\n\n` +
          `Possible issues:\n` +
          `• User does not exist in backend database\n` +
          `• Password is incorrect\n` +
          `• Check browser console (F12) for details`,
          {
            title: 'Login Failed (401 Unauthorized)',
            duration: 10000
          }
        )
      } else if (err.message.includes('network') || err.message.includes('connection') || err.message.includes('Network Error')) {
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        error(
          `Network error. Backend server might be down or unreachable.\n\n` +
          `Backend URL: ${backendUrl}\n\n` +
          `Please check:\n` +
          `• Backend server is running\n` +
          `• Internet connection is working\n` +
          `• Backend URL is correct`,
          {
            title: 'Connection Error',
            duration: 10000
          }
        )
      } else if (err.message.includes('server') || err.message.includes('500')) {
        error('Server error. Please try again later.', {
          title: 'Server Error',
          duration: 8000
        })
      } else {
        error(errorMessage, {
          title: 'Login Error',
          duration: 6000
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Theme Toggle - Top Right */}
      <div className="position-absolute top-0 end-0 p-3" style={{ zIndex: 1000 }}>
        <ThemeToggle />
      </div>
      
      <Container fluid className="h-100 p-0">
        <Row className="g-0 h-100">
          {/* Left Side - Photography Image */}
          <Col lg={6} className="d-none d-lg-flex login-image-section">
            <div className="login-image-wrapper">
              <img 
                src={bgLoginImg} 
                alt="Professional Photography" 
                className="login-image"
              />
              <div className="login-image-overlay">
                <div className="login-image-content">
                  <img src={logoImg} alt={LOGO_ALT_TEXT} className="login-image-logo" />
                  <h2 className="login-image-title">{APP_NAME}</h2>
                  <p className="login-image-subtitle">{APP_TAGLINE}</p>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col lg={6} className="d-flex align-items-center justify-content-center login-form-section">
            <div className="login-form-container">
              {/* Logo/Brand Section - Mobile Only */}
              <div className="text-center mb-4 d-lg-none">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 p-3" 
                     style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                  <img src={logoImg} alt={LOGO_ALT_TEXT} style={{ width: '100px', height: 'auto' }} />
                </div>
                <h2 className="text-dark fw-bold mb-1">{APP_NAME}</h2>
                <p className="text-muted mb-0">{APP_SUBTITLE}</p>
              </div>

              {/* Logo/Brand Section - Desktop Only */}
              <div className="text-center mb-4 d-none d-lg-block">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 p-3" 
                     style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                  <img src={logoImg} alt={LOGO_ALT_TEXT} style={{ width: '120px', height: 'auto' }} />
                </div>
                <h2 className="text-dark fw-bold mb-1">{APP_NAME}</h2>
                <p className="text-muted mb-0">{APP_SUBTITLE}</p>
              </div>

              <div className="auth-card">
                <div className="text-center mb-4">
                  <h3 className="mb-2">Welcome Back</h3>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                <Form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <div className="position-relative">
                      <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                      <FormControl
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <div className="invalid-feedback d-block">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="position-relative">
                      <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                      <FormControl
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        className={`auth-input ${errors.password ? 'is-invalid' : ''}`}
                      />
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                  </div>

                  <div className="mb-4 d-flex justify-content-between align-items-center">
                    <FormCheck
                      type="checkbox"
                      name="remember"
                      label="Remember me"
                      checked={formData.remember}
                      onChange={handleChange}
                      className="fw-medium"
                    />
                    <Link to="/forgot-password" className="text-decoration-none text-primary fw-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="auth-button w-100"
                    variant="primary"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Form>
              </div>

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="text-muted small mb-0">
                  {FOOTER_TEXT()} | Powered by{' '}
                  <a 
                    href={BRAND_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-decoration-none text-primary fw-medium"
                  >
                    {BRAND_NAME}
                  </a>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login