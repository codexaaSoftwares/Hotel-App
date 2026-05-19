# Image Upload Handling & Storage Guide

This document explains how image uploads are handled, the folder structure, and how URLs are managed in both localhost and production environments.

---

## 📁 Folder Structure

### Backend Storage Structure

All uploaded images are stored in the Laravel storage directory:

```
backend/
├── storage/
│   └── app/
│       └── public/
│           ├── avatars/          # User profile images
│           ├── logos/             # Business logos
│           ├── food-items/        # Food item images
│           ├── food-categories/   # Food category images
│           ├── room-categories/   # Room category images (if needed)
│           ├── rooms/             # Room images (if needed)
│           └── [other-modules]/   # Other module-specific images
```

### Database Storage

In the database, images are stored as **relative paths** (without the `public/` prefix):

- ✅ **Correct**: `food-items/food_item_1_1234567890_abc123.jpg`
- ❌ **Incorrect**: `public/food-items/food_item_1_1234567890_abc123.jpg`
- ❌ **Incorrect**: `/food-items/food_item_1_1234567890_abc123.jpg`

---

## 🔄 Image Upload Process

### Backend Upload Flow

1. **Validation**: File type (JPEG, PNG, WebP) and size (max 2MB)
2. **Generate Unique Filename**: `{prefix}_{id}_{timestamp}_{uniqid}.{extension}`
3. **Store File**: Using Laravel's `storeAs()` method
4. **Save Relative Path**: Store path without `public/` prefix in database
5. **Delete Old File**: If updating, delete previous image
6. **Return Full URL**: Generate and return complete URL for frontend

### Example: Backend Controller Method

```php
use App\Http\Controllers\Concerns\GeneratesStorageUrl;

class FoodItemController extends Controller
{
    use GeneratesStorageUrl;

    public function uploadImage(Request $request, FoodItem $foodItem)
    {
        // 1. Validate
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // 2MB max
        ]);

        // 2. Delete old image if exists
        if ($foodItem->image) {
            $oldPath = storage_path('app/public/' . $foodItem->image);
            if (file_exists($oldPath)) {
                @unlink($oldPath);
            }
        }

        // 3. Store new image
        $file = $request->file('image');
        $filename = 'food_item_' . $foodItem->id . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('public/food-items', $filename);
        
        // 4. Get relative path (without 'public/' prefix)
        $relativePath = 'food-items/' . $filename;

        // 5. Update database
        $foodItem->image = $relativePath;
        $foodItem->save();

        // 6. Generate and return full URL
        $imageUrl = $this->getStorageUrl($relativePath);

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'path' => $relativePath,
                'url' => $imageUrl,
            ]
        ]);
    }
}
```

### Frontend Upload Flow

1. **User Selects Image**: Using `<ImageUpload>` component or file input
2. **Preview**: Show preview using `FileReader` (data URL)
3. **Form Submission**: Send image as `FormData` with multipart/form-data
4. **Display**: Use returned URL or construct URL from path

### Example: Frontend Upload

```jsx
import ImageUpload from '../../../components/common/ImageUpload'
import { foodItemService } from '../../../services/menuService'

const MyForm = () => {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const handleImageChange = (dataUrl) => {
    setImagePreview(dataUrl)
    // Convert data URL to File object for upload
    if (dataUrl && dataUrl.startsWith('data:')) {
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'image.jpg', { type: blob.type })
          setImageFile(file)
        })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await foodItemService.uploadImage(foodItemId, formData)
    if (response.success) {
      // Image uploaded, URL is in response.data.url
      console.log('Image URL:', response.data.url)
    }
  }

  return (
    <ImageUpload
      value={imagePreview}
      onChange={handleImageChange}
      label="Food Item Image"
      required
    />
  )
}
```

---

## 🌐 URL Handling

### Storage URL Pattern

All storage files are served through a custom handler at:

```
/admin/api/storage/{relative-path}
```

### Backend URL Generation

The `GeneratesStorageUrl` trait provides a consistent way to generate storage URLs:

**Location**: `backend/app/Http/Controllers/Concerns/GeneratesStorageUrl.php`

```php
protected function getStorageUrl(string $relativePath): string
{
    $appUrl = rtrim(config('app.url'), '/');
    
    // Extract domain and port from APP_URL
    $parsedUrl = parse_url($appUrl);
    $scheme = $parsedUrl['scheme'] ?? 'http';
    $host = $parsedUrl['host'] ?? 'localhost';
    $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
    
    // Build domain with port
    $domain = $scheme . '://' . $host . $port;
    
    // Storage files are always served at /admin/api/storage/
    return $domain . '/admin/api/storage/' . $relativePath;
}
```

### Frontend URL Generation

**Location**: `admin/src/utils/imageUtils.js`

```javascript
export function getImageUrl(url, path = null) {
  // If full URL is provided, use it directly
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }
  
  // If no URL but path is provided, construct full URL
  if (!url && path) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    
    try {
      const urlObj = new URL(baseURL)
      const domain = `${urlObj.protocol}//${urlObj.host}${urlObj.port ? ':' + urlObj.port : ''}`
      return `${domain}/admin/api/storage/${path}`
    } catch (err) {
      const cleanUrl = baseURL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
      return `${cleanUrl}/admin/api/storage/${path}`
    }
  }
  
  // If URL is provided but not a full URL, treat it as a path
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    
    try {
      const urlObj = new URL(baseURL)
      const domain = `${urlObj.protocol}//${urlObj.host}${urlObj.port ? ':' + urlObj.port : ''}`
      return `${domain}/admin/api/storage/${url}`
    } catch (err) {
      const cleanUrl = baseURL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
      return `${cleanUrl}/admin/api/storage/${url}`
    }
  }
  
  return null
}
```

### Usage in Frontend

```javascript
import { getImageUrl } from '../../../utils/imageUtils'

// Option 1: Backend returns full URL (preferred)
const imageUrl = item.image // Already full URL: http://localhost:8000/admin/api/storage/food-items/...

// Option 2: Backend returns only path, construct URL
const imageUrl = getImageUrl(null, item.image_path)

// Option 3: Handle both cases
const imageUrl = getImageUrl(item.image_url, item.image_path)
```

---

## 🔧 Custom Storage Handler

### Why Custom Handler?

Instead of using Laravel's symbolic link (`php artisan storage:link`), we use a custom handler in `public/index.php` that works on shared hosting where symlinks may not be supported.

**Location**: `backend/public/index.php`

```php
$adminPathPrefix = '/admin';
$requestUri = $_SERVER['REQUEST_URI'] ?? null;

// Handle storage files directly (bypass Laravel routing)
if ($requestUri && str_starts_with($requestUri, $adminPathPrefix . '/api/storage/')) {
    // Extract the storage path (remove /admin/api/storage/)
    $storagePath = substr($requestUri, strlen($adminPathPrefix . '/api/storage/'));
    
    // Remove query string from storage path
    if (($queryPos = strpos($storagePath, '?')) !== false) {
        $storagePath = substr($storagePath, 0, $queryPos);
    }
    
    // Build the full file path
    $filePath = __DIR__ . '/../storage/app/public/' . $storagePath;
    
    // Check if file exists
    if (file_exists($filePath) && is_file($filePath)) {
        // Get MIME type
        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
        
        // Set headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
        header('Access-Control-Allow-Origin: *'); // Allow CORS if needed
        
        // Output file
        readfile($filePath);
        exit;
    } else {
        // File not found
        http_response_code(404);
        header('Content-Type: text/plain');
        echo 'File not found: ' . htmlspecialchars($storagePath);
        exit;
    }
}
```

### Benefits

- ✅ Works on shared hosting (no symlink required)
- ✅ Direct file serving (faster than Laravel routing)
- ✅ Proper MIME types and caching headers
- ✅ CORS support for cross-origin requests

---

## 🌍 Environment-Specific URLs

### Localhost Development

**Backend `.env`**:
```env
APP_URL=http://localhost:8000
```

**Frontend `.env`**:
```env
VITE_API_BASE_URL=http://localhost:8000/admin/api
```

**Generated URL Example**:
```
http://localhost:8000/admin/api/storage/food-items/food_item_1_1234567890_abc123.jpg
```

### Production Server

**Backend `.env`**:
```env
APP_URL=https://yourdomain.com
```

**Frontend `.env`**:
```env
VITE_API_BASE_URL=https://yourdomain.com/admin/api
```

**Generated URL Example**:
```
https://yourdomain.com/admin/api/storage/food-items/food_item_1_1234567890_abc123.jpg
```

### Subdirectory Installation

If the application is installed in a subdirectory (e.g., `/hotel-app`):

**Backend `.env`**:
```env
APP_URL=https://yourdomain.com/hotel-app
```

**Frontend `.env`**:
```env
VITE_API_BASE_URL=https://yourdomain.com/hotel-app/admin/api
```

**Generated URL Example**:
```
https://yourdomain.com/hotel-app/admin/api/storage/food-items/food_item_1_1234567890_abc123.jpg
```

---

## 📝 API Resource Pattern

When returning image data in API responses, always include the full URL:

```php
// In Resource class (e.g., FoodItemResource.php)
public function toArray($request)
{
    $imageUrl = null;
    if ($this->image) {
        $appUrl = rtrim(config('app.url'), '/');
        $parsedUrl = parse_url($appUrl);
        $scheme = $parsedUrl['scheme'] ?? 'http';
        $host = $parsedUrl['host'] ?? 'localhost';
        $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
        
        $domain = $scheme . '://' . $host . $port;
        $imageUrl = $domain . '/admin/api/storage/' . $this->image;
    }

    return [
        'id' => $this->id,
        'name' => $this->name,
        'image' => $imageUrl, // Full URL
        // ... other fields
    ];
}
```

**Better Approach**: Use the `GeneratesStorageUrl` trait in Resource classes:

```php
use App\Http\Controllers\Concerns\GeneratesStorageUrl;

class FoodItemResource extends JsonResource
{
    use GeneratesStorageUrl;

    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $this->image ? $this->getStorageUrl($this->image) : null,
            // ... other fields
        ];
    }
}
```

---

## 🎨 ImageUpload Component

### Component Location

`admin/src/components/common/ImageUpload.jsx`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current image URL or data URL for preview |
| `onChange` | `function` | - | Callback when image changes (receives data URL) |
| `label` | `string` | `'Image'` | Label text |
| `required` | `boolean` | `false` | Show required indicator |
| `accept` | `string` | `'image/*'` | Accepted file types |
| `maxSize` | `number` | `5MB` | Maximum file size in bytes |
| `previewSize` | `object` | `{width: 200, height: 150}` | Preview dimensions |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable upload |
| `error` | `string` | `null` | Error message to display |

### Usage Example

```jsx
import ImageUpload from '../../../components/common/ImageUpload'

const MyForm = () => {
  const [imagePreview, setImagePreview] = useState('')

  return (
    <ImageUpload
      value={imagePreview}
      onChange={setImagePreview}
      label="Product Image"
      required
      maxSize={2 * 1024 * 1024} // 2MB
      previewSize={{ width: 300, height: 200 }}
    />
  )
}
```

### Features

- ✅ Drag and drop support
- ✅ Image preview
- ✅ File validation (type and size)
- ✅ Remove image functionality
- ✅ Visual feedback (drag active state)
- ✅ Error display

---

## 🔐 File Validation Rules

### Backend Validation

Always validate uploads in the backend:

```php
$validated = $request->validate([
    'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // 2MB max
]);
```

**Rules**:
- `required`: File must be provided
- `image`: Must be an image file
- `mimes:jpeg,jpg,png,webp`: Allowed formats
- `max:2048`: Maximum size in KB (2MB)

### Frontend Validation

The `ImageUpload` component validates:
- File type (must start with `image/`)
- File size (configurable via `maxSize` prop)

---

## 🗑️ File Deletion

### When Updating

Always delete the old file when uploading a new one:

```php
// Delete old image if exists
if ($model->image) {
    $oldPath = storage_path('app/public/' . $model->image);
    if (file_exists($oldPath)) {
        @unlink($oldPath);
    }
}
```

### When Deleting Record

Delete associated image when deleting the record:

```php
public function destroy($id)
{
    $model = Model::findOrFail($id);
    
    // Delete associated image
    if ($model->image) {
        $imagePath = storage_path('app/public/' . $model->image);
        if (file_exists($imagePath)) {
            @unlink($imagePath);
        }
    }
    
    $model->delete();
    
    return response()->json([
        'success' => true,
        'message' => 'Record deleted successfully'
    ]);
}
```

---

## 📋 Best Practices

### ✅ Do's

1. **Always validate** file type and size on both frontend and backend
2. **Generate unique filenames** using timestamp and uniqid
3. **Store relative paths** in database (without `public/` prefix)
4. **Return full URLs** in API responses for frontend convenience
5. **Delete old files** when updating or deleting records
6. **Use the `GeneratesStorageUrl` trait** for consistent URL generation
7. **Handle errors gracefully** with user-friendly messages
8. **Use the `ImageUpload` component** for consistent UI

### ❌ Don'ts

1. ❌ Don't store full URLs in database (use relative paths)
2. ❌ Don't trust frontend validation alone (always validate on backend)
3. ❌ Don't forget to delete old files when updating
4. ❌ Don't use original filenames (security risk)
5. ❌ Don't skip file existence checks before deletion
6. ❌ Don't hardcode URLs (use environment variables)

---

## 🔍 Troubleshooting

### Images Not Displaying

1. **Check file exists**: Verify file exists in `storage/app/public/{path}`
2. **Check permissions**: Ensure `storage/app/public` is writable (755)
3. **Check URL**: Verify URL matches pattern `/admin/api/storage/{path}`
4. **Check .env**: Ensure `APP_URL` is correct in backend `.env`
5. **Check CORS**: If cross-origin, verify CORS headers are set

### Upload Fails

1. **Check file size**: Ensure file is under 2MB (or configured limit)
2. **Check file type**: Only JPEG, PNG, WebP allowed
3. **Check permissions**: Storage directory must be writable
4. **Check disk space**: Ensure server has enough space
5. **Check logs**: Review Laravel logs for detailed error messages

### URL Generation Issues

1. **Check APP_URL**: Verify `APP_URL` in `.env` matches your domain
2. **Check subdirectory**: If installed in subdirectory, include it in `APP_URL`
3. **Check port**: For localhost, ensure port is included (e.g., `:8000`)
4. **Use trait**: Always use `GeneratesStorageUrl` trait for consistency

---

## 📚 Related Files

- **Backend Trait**: `backend/app/Http/Controllers/Concerns/GeneratesStorageUrl.php`
- **Storage Handler**: `backend/public/index.php` (lines 40-75)
- **Frontend Utility**: `admin/src/utils/imageUtils.js`
- **Upload Component**: `admin/src/components/common/ImageUpload.jsx`
- **Filesystem Config**: `backend/config/filesystems.php`

---

**Last Updated**: January 2025  
**Version**: 1.0.0

