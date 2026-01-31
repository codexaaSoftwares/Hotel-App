import React, { useState, useEffect } from 'react'
import { Modal, Button, Table as BootstrapTable, Badge, Form, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimes,
  faPlus,
  faEdit,
  faTrash,
  faTags,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { TextField } from '../../common/FormFields'
import { useToast } from '../../common/ToastProvider'
import expenseService from '../../../services/expenseService'

const ExpenseCategoryModal = ({ show, onHide, categories = [], onUpdate }) => {
  const { success, error } = useToast()
  const [localCategories, setLocalCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Fetch categories when modal opens
  useEffect(() => {
    if (show) {
      fetchCategories()
      setEditingId(null)
      setEditingName('')
      setNewCategoryName('')
      setIsAdding(false)
    }
  }, [show])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await expenseService.getExpenseCategories({ limit: 1000 })
      if (response.success) {
        const fetchedCategories = response.data || []
        setLocalCategories(fetchedCategories)
        // Trigger parent update to refresh categories list
        if (onUpdate) {
          onUpdate(fetchedCategories)
        }
      } else {
        error && error(response.message || 'Failed to load categories')
      }
    } catch (err) {
      console.error('Error loading categories:', err)
      error && error('Failed to load categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      error && error('Category name is required')
      return
    }

    const trimmedName = newCategoryName.trim()
    if (localCategories.some((cat) => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      error && error('Category with this name already exists')
      return
    }

    setLoading(true)
    try {
      const response = await expenseService.createExpenseCategory({
        name: trimmedName,
        status: 'active',
      })
      if (response.success) {
        setNewCategoryName('')
        setIsAdding(false)
        success && success('Category added successfully')
        
        // Fetch updated categories list from API
        const categoriesResponse = await expenseService.getExpenseCategories({ limit: 1000 })
        if (categoriesResponse.success) {
          const updatedCategories = categoriesResponse.data || []
          setLocalCategories(updatedCategories)
          // Trigger parent update to refresh categories list
          if (onUpdate) {
            onUpdate(updatedCategories)
          }
        }
      } else {
        error && error(response.message || 'Failed to add category')
      }
    } catch (err) {
      console.error('Error adding category:', err)
      error && error('Failed to add category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleEditSave = async (categoryId) => {
    if (!editingName.trim()) {
      error && error('Category name is required')
      return
    }

    const trimmedName = editingName.trim()
    const existingCategory = localCategories.find((cat) => cat.id === categoryId)
    if (
      existingCategory &&
      localCategories.some(
        (cat) => cat.id !== categoryId && cat.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      error && error('Category with this name already exists')
      return
    }

    setLoading(true)
    try {
      const response = await expenseService.updateExpenseCategory(categoryId, {
        name: trimmedName,
        status: existingCategory?.status || 'active',
      })
      if (response.success) {
        setEditingId(null)
        setEditingName('')
        success && success('Category updated successfully')
        
        // Fetch updated categories list from API
        const categoriesResponse = await expenseService.getExpenseCategories({ limit: 1000 })
        if (categoriesResponse.success) {
          const updatedCategories = categoriesResponse.data || []
          setLocalCategories(updatedCategories)
          // Trigger parent update to refresh categories list
          if (onUpdate) {
            onUpdate(updatedCategories)
          }
        }
      } else {
        error && error(response.message || 'Failed to update category')
      }
    } catch (err) {
      console.error('Error updating category:', err)
      error && error('Failed to update category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true)
      try {
        const response = await expenseService.deleteExpenseCategory(categoryId)
        if (response.success) {
          success && success('Category deleted successfully')
          
          // Fetch updated categories list from API
          const categoriesResponse = await expenseService.getExpenseCategories({ limit: 1000 })
          if (categoriesResponse.success) {
            const updatedCategories = categoriesResponse.data || []
            setLocalCategories(updatedCategories)
            // Trigger parent update to refresh categories list
            if (onUpdate) {
              onUpdate(updatedCategories)
            }
          }
        } else {
          error && error(response.message || 'Failed to delete category')
        }
      } catch (err) {
        console.error('Error deleting category:', err)
        error && error('Failed to delete category. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToggleStatus = async (categoryId) => {
    const category = localCategories.find((cat) => cat.id === categoryId)
    if (!category) return

    const newStatus = category.status === 'active' ? 'inactive' : 'active'
    setLoading(true)
    try {
      const response = await expenseService.updateExpenseCategory(categoryId, {
        name: category.name,
        status: newStatus,
      })
      if (response.success) {
        success && success(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
        
        // Fetch updated categories list from API
        const categoriesResponse = await expenseService.getExpenseCategories({ limit: 1000 })
        if (categoriesResponse.success) {
          const updatedCategories = categoriesResponse.data || []
          setLocalCategories(updatedCategories)
          // Trigger parent update to refresh categories list
          if (onUpdate) {
            onUpdate(updatedCategories)
          }
        }
      } else {
        error && error(response.message || 'Failed to update category status')
      }
    } catch (err) {
      console.error('Error updating category status:', err)
      error && error('Failed to update category status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // No need for handleSave - all changes are saved immediately

  const columns = [
    {
      key: 'name',
      label: 'Category Name',
      render: (value, category) => {
        if (editingId === category.id) {
          return (
            <InputGroup size="sm">
              <Form.Control
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEditSave(category.id)
                  } else if (e.key === 'Escape') {
                    handleEditCancel()
                  }
                }}
                autoFocus
              />
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleEditSave(category.id)}
                title="Save"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faCheck} />
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleEditCancel}
                title="Cancel"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </InputGroup>
          )
        }
        return <span className="fw-semibold">{category.name}</span>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, category) => (
        <Badge bg={category.status === 'active' ? 'success' : 'secondary'}>
          {category.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, category) => (
        <div className="d-flex gap-1">
          {editingId === category.id ? (
            <>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleEditSave(category.id)}
                title="Save"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faCheck} />
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleEditCancel}
                title="Cancel"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleEditStart(category)}
                title="Edit"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => handleToggleStatus(category.id)}
                title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                disabled={loading}
              >
                {category.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(category.id)}
                title="Delete"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faTags} className="me-2 text-primary" />
          Manage Expense Categories
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Add New Category */}
        <div className="mb-4 pb-3 border-bottom">
          <h6 className="mb-3">Add New Category</h6>
          {isAdding ? (
            <div className="d-flex gap-2">
              <div className="flex-grow-1">
                <Form.Control
                  type="text"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd()
                    } else if (e.key === 'Escape') {
                      setIsAdding(false)
                      setNewCategoryName('')
                    }
                  }}
                  autoFocus
                />
              </div>
              <Button variant="success" onClick={handleAdd} disabled={loading}>
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Add
              </Button>
              <Button variant="secondary" onClick={() => {
                setIsAdding(false)
                setNewCategoryName('')
              }} disabled={loading}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>
          ) : (
            <Button variant="outline-primary" onClick={() => setIsAdding(true)} disabled={loading}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Category
            </Button>
          )}
        </div>

        {/* Categories Table */}
        {localCategories.length > 0 ? (
          <BootstrapTable striped bordered hover responsive>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localCategories.map((category) => (
                <tr key={category.id}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(category[col.key], category) : category[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </BootstrapTable>
        ) : (
          <div className="text-center py-4 text-muted">
            <FontAwesomeIcon icon={faTags} size="2x" className="mb-2" />
            <p>No categories found. Add a new category to get started.</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide} disabled={loading}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ExpenseCategoryModal

