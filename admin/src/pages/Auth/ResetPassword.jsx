import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, FormControl, Button as RBButton } from 'react-bootstrap'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import { Button } from '../../components'
import { ThemeToggle } from '../../components'
import { APP_NAME, APP_SUBTITLE, FOOTER_TEXT, BRAND_NAME, BRAND_URL } from '../../constants/app'
import '../../styles/auth.css'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')

  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')
    
    if (!tokenParam || !emailParam) {
      showError('Invalid reset link. Please request a new password reset.')
      setTimeout(() => {
        navigate('/forgot-password')
      }, 2000)
      return
    }
    
    setToken(tokenParam)
    setEmail(emailParam)
  }, [searchParams, navigate, showError])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Password validation - consistent with project standards
    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.trim().length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Confirm password validation - consistent with project standards
    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password.trim() !== formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!token || !email) {
      showError('Invalid reset link. Please request a new password reset.')
      return
    }

    setLoading(true)

    try {
      const { default: authService } = await import('../../services/authService')
      const result = await authService.resetPassword({
        token,
        email,
        password: formData.password.trim(),
        password_confirmation: formData.confirmPassword.trim(),
      })

      if (result.success) {
        success(result.message || 'Password reset successful! Please sign in with your new password.')
        
        // Clear form
        setFormData({
          password: '',
          confirmPassword: ''
        })
        
        // Redirect to login
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        // Handle validation errors
        if (result.errors) {
          setErrors(result.errors)
          showError(result.message || 'Please fix the errors and try again.')
        } else {
          showError(result.message || 'Password reset failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Reset password error:', err)
      showError('Password reset failed. Please try again.')
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
      
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            {/* Logo/Brand Section */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-3" 
                   style={{ width: '80px', height: '80px' }}>
                <FontAwesomeIcon icon={faLock} size="2x" className="text-primary" />
              </div>
              <h2 className="text-dark fw-bold mb-1">{APP_NAME}</h2>
              <p className="text-muted mb-0">{APP_SUBTITLE}</p>
            </div>

            <div className="auth-card">
              <div className="text-center mb-4">
                <h3 className="mb-2">Reset Password</h3>
                <p className="text-muted">Enter your new password</p>
              </div>
              <Form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <div className="position-relative">
                    <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                    <FormControl
                      type="password"
                      name="password"
                      placeholder="New password"
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

                <div className="mb-3">
                  <div className="position-relative">
                    <FontAwesomeIcon icon={faCheckCircle} className="auth-input-icon" />
                    <FormControl
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      className={`auth-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="alert alert-info border-0 mb-4">
                  <small className="mb-0">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    Password requirements:
                    <ul className="mb-0 mt-2 small">
                      <li>At least 8 characters long</li>
                      <li>Must match confirmation</li>
                    </ul>
                  </small>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-button"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none text-primary fw-medium">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Login
                  </Link>
                </div>
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
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ResetPassword
