import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Button, Card, Badge, Spinner, Alert, Form, InputGroup, FormControl, Image } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUtensils,
  faPlus,
  faEdit,
  faTrash,
  faChevronDown,
  faChevronRight,
  faLeaf,
  faDrumstickBite,
  faSearch,
  faCompressArrowsAlt,
  faExpandArrowsAlt,
  faArrowUp,
  faArrowDown,
  faImage,
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import menuService from '../../services/menuService'
import CategoryForm from '../../components/pages/restaurant/CategoryForm'
import ItemForm from '../../components/pages/restaurant/ItemForm'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const MenuManagement = () => {
  const { hasPermission } = usePermissions()
  const { success, error, warning } = useToast()

  const canView = hasPermission
    ? hasPermission(PERMISSIONS.FOOD_CATEGORY_READ) || hasPermission(PERMISSIONS.FOOD_ITEM_READ)
    : true
  const canCreateCategory = hasPermission ? hasPermission(PERMISSIONS.FOOD_CATEGORY_WRITE) : true
  const canEditCategory = hasPermission ? hasPermission(PERMISSIONS.FOOD_CATEGORY_WRITE) : true
  const canDeleteCategory = hasPermission ? hasPermission(PERMISSIONS.FOOD_CATEGORY_DELETE) : true
  const canCreateItem = hasPermission ? hasPermission(PERMISSIONS.FOOD_ITEM_WRITE) : true
  const canEditItem = hasPermission ? hasPermission(PERMISSIONS.FOOD_ITEM_WRITE) : true
  const canDeleteItem = hasPermission ? hasPermission(PERMISSIONS.FOOD_ITEM_DELETE) : true

  const [menuData, setMenuData] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [categoryFormShow, setCategoryFormShow] = useState(false)
  const [itemFormShow, setItemFormShow] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    if (!canView) {
      setLoading(false)
      warning && warning('You do not have permission to view menu management.', { title: 'Access restricted' })
      return
    }

    loadMenuData()
  }, [canView, warning])

  const loadMenuData = async () => {
    setLoading(true)
    try {
      const [menuResponse, categoriesResponse] = await Promise.all([
        menuService.getMenuHierarchy(),
        menuService.getCategories(),
      ])

      if (menuResponse.success) {
        setMenuData(menuResponse.data)
        // Expand all categories by default
        const categoryIds = new Set(menuResponse.data.map((cat) => cat.id))
        setExpandedCategories(categoryIds)
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data)
      }
    } catch (err) {
      console.error('Error loading menu data:', err)
      error('Failed to load menu data.')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setCategoryFormShow(true)
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setCategoryFormShow(true)
  }

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all items in this category.`)) {
      return
    }

    setDeleting((prev) => ({ ...prev, category: category.id }))
    try {
      const response = await menuService.deleteCategory(category.id)
      if (response.success) {
        success('Category deleted successfully')
        loadMenuData()
      } else {
        error(response.message || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      error('Failed to delete category')
    } finally {
      setDeleting((prev) => ({ ...prev, category: null }))
    }
  }

  const handleSaveCategory = async (formData) => {
    setSaving(true)
    try {
      let response
      if (selectedCategory) {
        response = await menuService.updateCategory(selectedCategory.id, formData)
      } else {
        response = await menuService.createCategory(formData)
      }

      if (response.success) {
        success(selectedCategory ? 'Category updated successfully' : 'Category created successfully')
        setCategoryFormShow(false)
        setSelectedCategory(null)
        loadMenuData()
      } else {
        error(response.message || 'Failed to save category')
      }
    } catch (err) {
      console.error('Error saving category:', err)
      error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = (categoryId) => {
    setSelectedItem(null)
    setSelectedCategory({ id: categoryId })
    setItemFormShow(true)
  }

  const handleEditItem = (item) => {
    setSelectedItem(item)
    setItemFormShow(true)
  }

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return
    }

    setDeleting((prev) => ({ ...prev, item: item.id }))
    try {
      const response = await menuService.deleteItem(item.id)
      if (response.success) {
        success('Item deleted successfully')
        loadMenuData()
      } else {
        error(response.message || 'Failed to delete item')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      error('Failed to delete item')
    } finally {
      setDeleting((prev) => ({ ...prev, item: null }))
    }
  }

  const handleSaveItem = async (formData) => {
    setSaving(true)
    try {
      // Extract imageFile from formData
      const { imageFile, ...itemData } = formData
      
      let response
      let itemId = selectedItem?.id

      // Create or update item first
      if (selectedItem) {
        // When updating: don't include image field unless we're uploading a new file
        // This preserves the existing image in the database
        const updateData = { ...itemData }
        // Always remove image from updateData - we'll handle it separately
        delete updateData.image
        response = await menuService.updateItem(selectedItem.id, updateData)
        itemId = selectedItem.id
      } else {
        // Don't include image in create if it's a file (will upload after creation)
        const createData = { ...itemData }
        if (imageFile) {
          delete createData.image // Remove image URL if we're uploading a file
        }
        response = await menuService.createItem(createData)
        if (response.success && response.data) {
          itemId = response.data.id
        }
      }

      if (!response.success) {
        error(response.message || 'Failed to save item')
        return
      }

      // Upload image if a new file was selected
      if (imageFile && itemId) {
        const imageResponse = await menuService.uploadItemImage(itemId, imageFile)
        if (!imageResponse.success) {
          error(imageResponse.message || 'Item saved but image upload failed')
          // Still continue to reload data
        }
      }

      success(selectedItem ? 'Item updated successfully' : 'Item created successfully')
      setItemFormShow(false)
      setSelectedItem(null)
      setSelectedCategory(null)
      loadMenuData()
    } catch (err) {
      console.error('Error saving item:', err)
      error('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`
  }

  const getDefaultImage = () => {
    // Return a data URI for a simple placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
  }

  const handleMoveItemUp = async (item, categoryId) => {
    try {
      const response = await menuService.moveItemUp(item.id, categoryId)
      if (response.success) {
        success('Item moved up successfully')
        loadMenuData()
      } else {
        error(response.message || 'Failed to move item')
      }
    } catch (err) {
      console.error('Error moving item:', err)
      error('Failed to move item')
    }
  }

  const handleMoveItemDown = async (item, categoryId) => {
    try {
      const response = await menuService.moveItemDown(item.id, categoryId)
      if (response.success) {
        success('Item moved down successfully')
        loadMenuData()
      } else {
        error(response.message || 'Failed to move item')
      }
    } catch (err) {
      console.error('Error moving item:', err)
      error('Failed to move item')
    }
  }

  const getItemPosition = (item, categoryItems) => {
    const sortedItems = [...categoryItems].sort((a, b) => a.display_order - b.display_order)
    const index = sortedItems.findIndex((i) => i.id === item.id)
    return { index, total: sortedItems.length }
  }

  // Filter menu data based on search term and category filter
  const filteredMenuData = useMemo(() => {
    if (!searchTerm && !filterCategory) return menuData

    return menuData
      .filter((category) => {
        if (filterCategory && category.id.toString() !== filterCategory) return false
        return true
      })
      .map((category) => {
        if (!searchTerm) return category

        const filteredItems = category.items?.filter((item) => {
          const searchLower = searchTerm.toLowerCase()
          return (
            item.name.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.price.toString().includes(searchLower)
          )
        })

        return {
          ...category,
          items: filteredItems,
        }
      })
      .filter((category) => {
        // Show category if it matches search or has matching items
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
          category.name.toLowerCase().includes(searchLower) ||
          category.description?.toLowerCase().includes(searchLower) ||
          category.items?.length > 0
        )
      })
  }, [menuData, searchTerm, filterCategory])

  const toggleAllCategories = () => {
    if (expandedCategories.size === filteredMenuData.length) {
      setExpandedCategories(new Set())
    } else {
      const allIds = new Set(filteredMenuData.map((cat) => cat.id))
      setExpandedCategories(allIds)
    }
  }

  const totalItems = useMemo(() => {
    return menuData.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)
  }, [menuData])

  if (!canView) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">You do not have permission to view this page.</Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="px-0 px-xl-3">
      <Row className="g-4">
        <Col xs={12}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faUtensils} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Menu Management</h2>
            </div>
            {canCreateCategory && (
              <div className="ms-auto">
                <Button variant="primary" onClick={handleAddCategory} className="text-white">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Category
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filter Bar */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Form>
                <Row className="g-3 align-items-end">
                  <Col md={4} sm={12}>
                    <Form.Label className="fw-semibold text-muted">Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-2 text-muted">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        type="text"
                        placeholder="Search items or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-2"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3} sm={6}>
                    <Form.Label className="fw-semibold text-muted">Category</Form.Label>
                    <Form.Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border-2"
                    >
                      <option value="">All Categories</option>
                      {categories
                        .filter((cat) => cat.status === 'active')
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Col>
                  <Col md={2} sm={12} className="text-end">
                    <Form.Label className="fw-semibold text-muted d-block mb-2">Summary</Form.Label>
                    <Badge bg="secondary" className="px-3 py-2">
                      {menuData.length} Categories • {totalItems} Items
                    </Badge>
                  </Col>
                  <Col md={3} sm={6} className="text-end">
                    <Form.Label className="fw-semibold text-muted">Actions</Form.Label>
                    <div className="d-flex gap-2 justify-content-end">
                      <Button variant="outline-secondary" onClick={toggleAllCategories} className="border-2">
                        <FontAwesomeIcon
                          icon={expandedCategories.size === filteredMenuData.length ? faCompressArrowsAlt : faExpandArrowsAlt}
                          className="me-1"
                        />
                        {expandedCategories.size === filteredMenuData.length ? 'Collapse All' : 'Expand All'}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Main Content */}
          <Card className="shadow-sm">
            <Card.Body className="p-2">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="mt-2 text-muted small">Loading menu...</p>
                </div>
              ) : filteredMenuData.length === 0 ? (
                <Alert variant="info" className="text-center py-2 mb-0">
                  <FontAwesomeIcon icon={faUtensils} className="me-2" />
                  {searchTerm || filterCategory
                    ? 'No items found matching your search.'
                    : 'No categories found. Create your first category to get started.'}
                </Alert>
              ) : (
                <div className="menu-hierarchy">
                  {filteredMenuData.map((category) => {
                    const isExpanded = expandedCategories.has(category.id)
                    const isDeleting = deleting.category === category.id

                    return (
                      <div key={category.id} className="mb-2">
                        {/* Category Row - Compact */}
                        <div
                          className="d-flex align-items-center py-1 px-2 mb-1 rounded border"
                          style={{
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <FontAwesomeIcon
                            icon={isExpanded ? faChevronDown : faChevronRight}
                            className="me-2 text-muted"
                            style={{ fontSize: '0.75rem', width: '12px' }}
                          />
                          <div className="flex-grow-1 d-flex align-items-center gap-2">
                            <span className="fw-semibold">{category.name}</span>
                            {category.status === 'inactive' && (
                              <Badge bg="secondary" className="py-0" style={{ fontSize: '0.65rem' }}>
                                Inactive
                              </Badge>
                            )}
                            <Badge bg="light" text="dark" className="py-0" style={{ fontSize: '0.65rem' }}>
                              {category.items?.length || 0} items
                            </Badge>
                          </div>
                          <div className="d-flex gap-1">
                            {canCreateItem && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddItem(category.id)
                                }}
                              >
                                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.7rem' }} />
                              </Button>
                            )}
                            {canEditCategory && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditCategory(category)
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.7rem' }} />
                              </Button>
                            )}
                            {canDeleteCategory && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteCategory(category)
                                }}
                                disabled={isDeleting}
                              >
                                <FontAwesomeIcon icon={faTrash} style={{ fontSize: '0.7rem' }} />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Items Table - Compact */}
                        {isExpanded && category.items && category.items.length > 0 && (() => {
                          const sortedItems = [...category.items].sort((a, b) => a.display_order - b.display_order)
                          return (
                            <div className="ms-3">
                              <table className="table table-sm table-hover mb-1" style={{ fontSize: '0.8rem' }}>
                                <tbody>
                                  {sortedItems.map((item, idx) => {
                                    const isDeletingItem = deleting.item === item.id
                                    const position = getItemPosition(item, category.items)
                                    const canMoveUp = position.index > 0
                                    const canMoveDown = position.index < position.total - 1

                                    return (
                                      <tr key={item.id} style={{ fontSize: '0.8rem' }}>
                                        {/* Order - Up/Down */}
                                        <td style={{ width: '50px', padding: '4px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                                          <div className="d-flex flex-column gap-1">
                                            <Button
                                              variant="outline-secondary"
                                              size="sm"
                                              className="py-0 px-1"
                                              style={{ fontSize: '0.65rem', lineHeight: '1', minWidth: '24px' }}
                                              onClick={() => handleMoveItemUp(item, category.id)}
                                              disabled={!canMoveUp}
                                              title="Move up"
                                            >
                                              <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '0.6rem' }} />
                                            </Button>
                                            <Button
                                              variant="outline-secondary"
                                              size="sm"
                                              className="py-0 px-1"
                                              style={{ fontSize: '0.65rem', lineHeight: '1', minWidth: '24px' }}
                                              onClick={() => handleMoveItemDown(item, category.id)}
                                              disabled={!canMoveDown}
                                              title="Move down"
                                            >
                                              <FontAwesomeIcon icon={faArrowDown} style={{ fontSize: '0.6rem' }} />
                                            </Button>
                                          </div>
                                        </td>
                                        {/* Image */}
                                        <td style={{ width: '60px', padding: '4px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                                          <Image
                                            src={item.image || getDefaultImage()}
                                            alt={item.name}
                                            rounded
                                            style={{
                                              width: '40px',
                                              height: '40px',
                                              objectFit: 'cover',
                                              cursor: 'pointer',
                                            }}
                                            onError={(e) => {
                                              e.target.src = getDefaultImage()
                                            }}
                                          />
                                        </td>
                                        {/* Name */}
                                        <td style={{ padding: '4px 8px', verticalAlign: 'middle' }}>
                                          <div>
                                            <span className="fw-medium">{item.name}</span>
                                            {item.status === 'inactive' && (
                                              <Badge bg="secondary" className="ms-1 py-0" style={{ fontSize: '0.65rem' }}>
                                                Inactive
                                              </Badge>
                                            )}
                                            {item.description && (
                                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {item.description.length > 50
                                                  ? `${item.description.substring(0, 50)}...`
                                                  : item.description}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        {/* Veg/Non-veg Icon */}
                                        <td style={{ width: '40px', padding: '4px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                                          <FontAwesomeIcon
                                            icon={item.is_veg ? faLeaf : faDrumstickBite}
                                            className={item.is_veg ? 'text-success' : 'text-danger'}
                                            style={{ fontSize: '0.9rem' }}
                                          />
                                        </td>
                                        {/* Price */}
                                        <td style={{ width: '100px', padding: '4px 8px', textAlign: 'right', verticalAlign: 'middle' }}>
                                          <span className="fw-bold text-primary">{formatPrice(item.price)}</span>
                                        </td>
                                        {/* GST */}
                                        <td style={{ width: '80px', padding: '4px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                                          {item.gst_percentage ? (
                                            <span className="text-muted">{item.gst_percentage}%</span>
                                          ) : (
                                            <span className="text-muted">-</span>
                                          )}
                                        </td>
                                        {/* Actions */}
                                        <td style={{ width: '100px', padding: '4px 8px', textAlign: 'right', verticalAlign: 'middle' }}>
                                          <div className="d-flex gap-1 justify-content-end">
                                            {canEditItem && (
                                              <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="py-0 px-2"
                                                style={{ fontSize: '0.7rem' }}
                                                onClick={() => handleEditItem(item)}
                                              >
                                                <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.7rem' }} />
                                              </Button>
                                            )}
                                            {canDeleteItem && (
                                              <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="py-0 px-2"
                                                style={{ fontSize: '0.7rem' }}
                                                onClick={() => handleDeleteItem(item)}
                                                disabled={isDeletingItem}
                                              >
                                                <FontAwesomeIcon icon={faTrash} style={{ fontSize: '0.7rem' }} />
                                              </Button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )
                        })()}

                        {/* Empty State for Category */}
                        {isExpanded && (!category.items || category.items.length === 0) && (
                          <div className="ms-3 py-2 px-3 border rounded bg-light" style={{ fontSize: '0.8rem' }}>
                            <p className="mb-0 text-muted text-center">
                              No items in this category.{' '}
                              {canCreateItem && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0"
                                  style={{ fontSize: '0.8rem' }}
                                  onClick={() => handleAddItem(category.id)}
                                >
                                  Add one now
                                </Button>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Category Form Modal */}
      <CategoryForm
        show={categoryFormShow}
        onHide={() => {
          setCategoryFormShow(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSave={handleSaveCategory}
        loading={saving}
      />

      {/* Item Form Modal */}
      <ItemForm
        show={itemFormShow}
        onHide={() => {
          setItemFormShow(false)
          setSelectedItem(null)
          setSelectedCategory(null)
        }}
        item={selectedItem}
        categories={categories}
        selectedCategory={selectedItem ? null : selectedCategory} // Only pass when creating (not editing)
        onSave={handleSaveItem}
        loading={saving}
      />
    </Container>
  )
}

export default MenuManagement

