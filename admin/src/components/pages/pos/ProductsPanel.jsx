import React, { useState, useEffect } from 'react'
import { Badge, InputGroup, Form, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faPlus, faLeaf, faDrumstickBite, faChevronDown, faChevronUp, faStar } from '@fortawesome/free-solid-svg-icons'
import { getPOSMenu } from '../../../services/menuService'
import { useToast } from '../../../components'
import { useDebounce } from '../../../hooks'

const ProductsPanel = ({ onAddToCart, currentTable }) => {
  const { error } = useToast()
  const [categories, setCategories] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [isPopularExpanded, setIsPopularExpanded] = useState(true)

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    loadMenuData()
  }, [])

  useEffect(() => {
    // Expand all categories by default on load
    if (categories.length > 0 && expandedCategories.size === 0) {
      const allCategoryIds = new Set(categories.map((cat) => cat.id.toString()))
      setExpandedCategories(allCategoryIds)
    }
  }, [categories])

  const loadMenuData = async () => {
    setLoading(true)
    try {
      // Load POS menu (categories + popular items in one call)
      const response = await getPOSMenu(20)

      if (response.success) {
        // Set popular items
        setPopularItems(response.data.popularItems || [])

        // Process categories
        const activeCategories = (response.data.categories || [])
          .filter((cat) => cat.status === 'active')
          .map((cat) => ({
            ...cat,
            items: (cat.items || []).filter((item) => item.status === 'active'),
          }))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

        setCategories(activeCategories)

        // Flatten all items from all categories
        const items = activeCategories.flatMap((cat) =>
          (cat.items || []).map((item) => ({
            ...item,
            category_name: cat.name,
            category_id: cat.id,
          }))
        )
        setAllItems(items)
      } else {
        error && error(response.message || 'Failed to load menu')
      }
    } catch (err) {
      console.error('Error loading menu:', err)
      error && error('Failed to load menu. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId) => {
    const categoryIdStr = categoryId.toString()
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryIdStr)) {
        newSet.delete(categoryIdStr)
      } else {
        newSet.add(categoryIdStr)
      }
      return newSet
    })
  }

  const filterItemsByCategory = (categoryId) => {
    let items = allItems.filter((item) => item.category_id === categoryId)

    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by display_order
    return items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  }

  const filterAllItems = () => {
    let items = allItems

    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.category_name?.toLowerCase().includes(searchLower)
      )
    }

    return items
  }

  const filterPopularItems = () => {
    let items = popularItems

    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      )
    }

    return items
  }

  const handleAddProduct = (product) => {
    if (!currentTable) {
      error && error('Please select a table first')
      return
    }
    onAddToCart(product)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="primary" size="sm" />
      </div>
    )
  }

  // If searching, show all filtered items grouped by category
  const isSearching = debouncedSearch.trim().length > 0
  const filteredAllItems = isSearching ? filterAllItems() : []

  return (
    <div className="products-panel h-100 d-flex flex-column">
      {/* Panel Header - Compact */}
      <div className="p-2 border-bottom bg-white">
        <h6 className="mb-2 fw-semibold" style={{ fontSize: '14px' }}>Products</h6>

        {/* Search Bar */}
        <InputGroup size="sm">
          <InputGroup.Text style={{ fontSize: '12px' }}>
            <FontAwesomeIcon icon={faSearch} style={{ fontSize: '11px' }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '12px' }}
          />
        </InputGroup>
      </div>

      {/* Categories with Expandable Items */}
      <div className="flex-grow-1 overflow-auto">
        {isSearching && filteredAllItems.length > 0 ? (
          // Show search results grouped by category
          <div className="p-2">
            {categories
              .filter((cat) => filteredAllItems.some((item) => item.category_id === cat.id))
              .map((category) => {
                const categoryItems = filteredAllItems.filter((item) => item.category_id === category.id)
                if (categoryItems.length === 0) return null

                return (
                  <div key={category.id} className="mb-3">
                    <div className="d-flex align-items-center mb-2 px-2">
                      <h6 className="mb-0 fw-semibold" style={{ fontSize: '13px' }}>
                        {category.name}
                      </h6>
                      <Badge bg="secondary" className="ms-2" style={{ fontSize: '10px' }}>
                        {categoryItems.length}
                      </Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-2 pb-2">
                      {categoryItems.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAdd={handleAddProduct}
                          currentTable={currentTable}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : isSearching ? (
          <div className="text-center text-muted p-4">
            <p style={{ fontSize: '12px' }}>No products found</p>
          </div>
        ) : (
          // Show all categories in expandable format
          <div className="p-2">
            {/* Popular Items Section */}
            {popularItems.length > 0 && (
              <div className="mb-2">
                {/* Popular Header - Clickable */}
                <div
                  className="category-header p-2 bg-light border rounded cursor-pointer"
                  onClick={() => setIsPopularExpanded(!isPopularExpanded)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '13px',
                    minHeight: '36px',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon
                        icon={isPopularExpanded ? faChevronDown : faChevronUp}
                        style={{ fontSize: '10px', color: '#6b7280' }}
                      />
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-warning"
                        style={{ fontSize: '11px' }}
                      />
                      <span className="fw-semibold">Popular</span>
                      <Badge bg="secondary" style={{ fontSize: '10px' }}>
                        {popularItems.length}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Popular Items - Expandable */}
                {isPopularExpanded && (
                  <div className="category-items mt-1">
                    <div className="d-flex flex-wrap gap-2 pb-2">
                      {popularItems.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAdd={handleAddProduct}
                          currentTable={currentTable}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regular Categories */}
            {categories.map((category) => {
              const categoryItems = filterItemsByCategory(category.id)
              const isExpanded = expandedCategories.has(category.id.toString())

              if (categoryItems.length === 0) return null

              return (
                <div key={category.id} className="mb-2">
                  {/* Category Header - Clickable */}
                  <div
                    className="category-header p-2 bg-light border rounded cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '13px',
                      minHeight: '36px',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronDown : faChevronUp}
                          style={{ fontSize: '10px', color: '#6b7280' }}
                        />
                        <span className="fw-semibold">{category.name}</span>
                        <Badge bg="secondary" style={{ fontSize: '10px' }}>
                          {categoryItems.length}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Category Items - Expandable (Wrapping Grid) */}
                  {isExpanded && (
                    <div className="category-items mt-1">
                      <div className="d-flex flex-wrap gap-2 pb-2">
                        {categoryItems.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAdd={handleAddProduct}
                            currentTable={currentTable}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!isSearching && categories.length === 0 && popularItems.length === 0 && (
          <div className="text-center text-muted p-4">
            <p style={{ fontSize: '12px' }}>No products available</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact Product Card Component - Horizontal Layout with Fixed Width
const ProductCard = ({ product, onAdd, currentTable }) => {
  return (
    <div
      className="product-card-compact bg-white border rounded p-2 cursor-pointer transition-all d-flex align-items-center gap-2"
      onClick={() => onAdd(product)}
      style={{
        width: 'calc(31.00% - 4px)', // Fixed width: 3 columns with gap
        minHeight: '60px',
        flexShrink: 0,
        cursor: currentTable ? 'pointer' : 'not-allowed',
        opacity: currentTable ? 1 : 0.6,
      }}
    >
      {/* Product Image - Square */}
      <div className="position-relative flex-shrink-0" style={{ width: '50px', height: '50px' }}>
        <div
          className="w-100 h-100 rounded"
          style={{
            overflow: 'hidden',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <FontAwesomeIcon
              icon={product.is_veg ? faLeaf : faDrumstickBite}
              className={product.is_veg ? 'text-success' : 'text-danger'}
              style={{ fontSize: '18px' }}
            />
          )}
        </div>
        {/* Veg/Non-Veg Badge */}
        <Badge
          bg={product.is_veg ? 'success' : 'danger'}
          className="position-absolute top-0 end-0"
          style={{ fontSize: '8px', padding: '1px 3px', transform: 'translate(25%, -25%)' }}
        >
          {product.is_veg ? 'V' : 'NV'}
        </Badge>
      </div>

      {/* Product Name & Price - Middle Section */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center" style={{ minWidth: 0 }}>
        <div className="fw-semibold text-truncate mb-1" style={{ fontSize: '12px', lineHeight: '1.2' }}>
          {product.name}
        </div>
        <div className="fw-bold text-primary" style={{ fontSize: '13px' }}>
          ₹{parseFloat(product.price).toFixed(0)}
        </div>
      </div>

      {/* Add Button - Right */}
      <div className="flex-shrink-0">
        <button
          className="btn btn-sm btn-primary d-flex align-items-center justify-content-center"
          onClick={(e) => {
            e.stopPropagation()
            onAdd(product)
          }}
          disabled={!currentTable}
          style={{
            fontSize: '11px',
            width: '32px',
            height: '32px',
            padding: '0',
            borderRadius: '6px',
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '12px' }} />
        </button>
      </div>
    </div>
  )
}

export default ProductsPanel

