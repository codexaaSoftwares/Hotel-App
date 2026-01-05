import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfileForm from '../ProfileForm'

// Mock the FormFields components
jest.mock('../../common/FormFields', () => ({
  TextField: ({ id, label, value, onChange, placeholder, required, col, disabled, invalid, feedback, ...props }) => (
    <div className={`col-${col}`}>
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={id}
        className={`form-control ${invalid ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {feedback && <div className="invalid-feedback">{feedback}</div>}
    </div>
  ),
  SelectField: ({ id, label, value, onChange, options, col, disabled }) => (
    <div className={`col-${col}`}>
      <label htmlFor={id} className="form-label">{label}</label>
      <select
        id={id}
        className="form-select"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
  FormRow: ({ children }) => <div className="row">{children}</div>
}))

const mockUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'United States',
  bio: 'Software developer',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  avatar: 'https://example.com/avatar.jpg'
}

describe('ProfileForm Component', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders in view mode correctly', () => {
    render(
      <ProfileForm
        mode="view"
        userData={mockUserData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+1-555-0123')).toBeInTheDocument()
  })

  test('renders in edit mode correctly', () => {
    render(
      <ProfileForm
        mode="edit"
        userData={mockUserData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  test('validates required fields', async () => {
    render(
      <ProfileForm
        mode="edit"
        userData={{}}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const firstNameInput = screen.getByLabelText('First Name')
    const lastNameInput = screen.getByLabelText('Last Name')
    const emailInput = screen.getByLabelText('Email Address')

    // Clear required fields
    fireEvent.change(firstNameInput, { target: { value: '' } })
    fireEvent.change(lastNameInput, { target: { value: '' } })
    fireEvent.change(emailInput, { target: { value: '' } })

    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
      expect(screen.getByText('Last name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  test('validates email format', async () => {
    render(
      <ProfileForm
        mode="edit"
        userData={{ firstName: 'John', lastName: 'Doe' }}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const emailInput = screen.getByLabelText('Email Address')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  test('calls onSubmit with valid data', async () => {
    render(
      <ProfileForm
        mode="edit"
        userData={mockUserData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(mockUserData)
    })
  })

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <ProfileForm
        mode="edit"
        userData={mockUserData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
