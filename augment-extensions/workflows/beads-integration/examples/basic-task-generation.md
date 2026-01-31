# Basic Task Generation Examples

## Overview

This document demonstrates basic task generation with examples showing the transformation from a simple specification to a comprehensive Beads task. It includes before/after comparisons and configuration examples.

## Example 1: Simple Feature Specification

### Input Specification

```markdown
# Feature: User Profile Picture Upload

Users should be able to upload a profile picture. The picture should be displayed on their profile page.
```

### Step-by-Step Decomposition

#### Step 1: Identify Core Requirements
- File upload functionality
- Image storage
- Profile page display
- Validation (file type, size)

#### Step 2: Break Down into Tasks
1. Backend: File upload endpoint
2. Backend: Image storage and retrieval
3. Frontend: Upload UI component
4. Frontend: Display profile picture

#### Step 3: Apply Core Rules

For Task 1 (Backend: File upload endpoint):

**Title**: Create profile picture upload endpoint

**Description**: Implement POST /api/users/:id/profile-picture endpoint that accepts image uploads, validates file type and size, and stores the image.

**Prerequisites**:
- [ ] File storage service configured (S3 or local storage)
- [ ] Image processing library installed (sharp or jimp)
- [ ] User authentication middleware implemented

**Steps**:
1. Create POST /api/users/:id/profile-picture route
2. Add multer middleware for file upload handling
3. Validate file type (JPEG, PNG, GIF only)
4. Validate file size (max 5MB)
5. Resize image to 400x400px
6. Generate unique filename
7. Store image in file storage
8. Update user record with image URL
9. Return image URL in response

**Verification**:
- [ ] Endpoint accepts valid image files
- [ ] Endpoint rejects invalid file types
- [ ] Endpoint rejects files > 5MB
- [ ] Image is resized to 400x400px
- [ ] Image URL is stored in user record
- [ ] Endpoint returns 400 for invalid requests
- [ ] Endpoint returns 200 with image URL for valid requests

**Success Metrics**:
- Upload success rate > 99%
- Upload time < 2 seconds
- Image quality maintained after resize
- No security vulnerabilities (file type validation)

### Before/After Comparison

#### ❌ BEFORE: Minimal Task (Unacceptable)

```markdown
# Task: Add profile picture upload

## Description
Users can upload profile pictures

## Steps
1. Create upload endpoint
2. Store image
3. Display on profile

## Verification
- Upload works
```

**Problems**:
- No specific endpoint details
- No validation requirements
- No error handling
- No measurable success criteria
- Missing prerequisites
- Vague steps

#### ✅ AFTER: Comprehensive Task (Acceptable)

```markdown
# Task: Create profile picture upload endpoint

## Description
Implement POST /api/users/:id/profile-picture endpoint that accepts image uploads, validates file type and size, resizes images, and stores them securely.

## Context
Users need to personalize their profiles with pictures. This endpoint will handle the upload, validation, and storage of profile pictures.

## Prerequisites
- [ ] File storage service configured (AWS S3 or local storage)
- [ ] Image processing library installed (sharp npm package)
- [ ] User authentication middleware implemented
- [ ] User model includes profilePictureUrl field

## Inputs
- **User ID**: From URL parameter (:id)
- **Image File**: Multipart form data (field name: "profilePicture")
- **Auth Token**: JWT token in Authorization header

## Outputs
- **Success Response**: { "imageUrl": "https://..." }
- **Error Response**: { "error": "Invalid file type" }

## Steps
1. **Create route handler**
   - Add POST /api/users/:id/profile-picture route
   - Apply authentication middleware
   - Apply authorization check (user can only upload own picture)

2. **Configure multer middleware**
   - Set up multer with memory storage
   - Configure file size limit (5MB)
   - Set field name to "profilePicture"

3. **Implement validation**
   - Check file exists in request
   - Validate MIME type (image/jpeg, image/png, image/gif)
   - Validate file size <= 5MB
   - Return 400 error if validation fails

4. **Process image**
   - Use sharp to resize image to 400x400px
   - Maintain aspect ratio with cover fit
   - Convert to JPEG format
   - Compress to 80% quality

5. **Store image**
   - Generate unique filename (userId-timestamp.jpg)
   - Upload to S3 or save to local storage
   - Get public URL for image

6. **Update user record**
   - Update user.profilePictureUrl with image URL
   - Save user record to database

7. **Return response**
   - Return 200 with { "imageUrl": "..." }
   - Include appropriate headers

## Dependencies
### Blocks
- `bd-auth`: User authentication middleware must be implemented
- `bd-storage`: File storage service must be configured

### Related
- `bd-profile-display`: Profile page will display this image

## Edge Cases
### Case 1: User uploads non-image file
- **Condition**: File MIME type is not image/*
- **Handling**: Return 400 error with message "Invalid file type"
- **Expected Outcome**: Upload rejected, user notified

### Case 2: File size exceeds limit
- **Condition**: File size > 5MB
- **Handling**: Multer rejects upload, return 400 error
- **Expected Outcome**: Upload rejected before processing

### Case 3: Storage service unavailable
- **Condition**: S3 or storage service returns error
- **Handling**: Return 500 error, log error, retry once
- **Expected Outcome**: User notified, error logged for investigation

## Error Handling
### Error 1: Invalid file type
- **Cause**: User uploads non-image file
- **Detection**: MIME type check fails
- **Resolution**: Return 400 with clear error message
- **Prevention**: Client-side validation (accept="image/*")

### Error 2: Storage failure
- **Cause**: S3 unavailable or disk full
- **Detection**: Storage operation throws error
- **Resolution**: Return 500, log error, alert ops team
- **Prevention**: Monitor storage health and capacity

## Verification
- [ ] Endpoint accepts JPEG, PNG, GIF files
- [ ] Endpoint rejects non-image files (400 error)
- [ ] Endpoint rejects files > 5MB (400 error)
- [ ] Image is resized to 400x400px
- [ ] Image quality is acceptable after processing
- [ ] Image URL is stored in user.profilePictureUrl
- [ ] Endpoint requires authentication
- [ ] User can only upload own profile picture
- [ ] Storage errors handled gracefully
- [ ] Response includes correct image URL

## Success Metrics
- **Upload Success Rate**: > 99% for valid files
- **Upload Time**: < 2 seconds (p95)
- **Image Quality**: SSIM > 0.95 after resize
- **Error Rate**: < 1% for valid requests

## Testing
### Unit Tests
- Validate file type validation logic
- Validate file size validation logic
- Test image resize function
- Test filename generation

### Integration Tests
- Upload valid JPEG file - success
- Upload valid PNG file - success
- Upload PDF file - 400 error
- Upload 10MB file - 400 error
- Upload without authentication - 401 error
- Upload to another user's profile - 403 error

## Documentation
- [ ] API endpoint documented in API docs
- [ ] Error codes documented
- [ ] File size and type limits documented
- [ ] Example request/response added

## Rollback Plan
1. Remove route from API
2. Revert user model changes
3. Clean up uploaded images (if any)
4. Verify API works without endpoint

## Estimated Effort
- **Time**: 4-6 hours
- **Complexity**: Medium
- **Risk**: Low

## Resources
- [Multer documentation](https://github.com/expressjs/multer)
- [Sharp documentation](https://sharp.pixelplumbing.com/)
- [AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/)
```

**Improvements**:
- ✅ Specific endpoint and method
- ✅ Detailed validation requirements
- ✅ Comprehensive error handling
- ✅ Measurable success criteria
- ✅ Clear prerequisites
- ✅ Step-by-step instructions
- ✅ Edge cases documented
- ✅ Testing requirements specified

## Configuration Example for Basic Mode

```json
{
  "mode": "basic",
  "features": {
    "task_generation": true,
    "openspec_integration": false,
    "typescript_commands": false,
    "effectiveness_rules": true
  },
  "rules": {
    "task_detail_level": "standard",
    "require_dependencies": true,
    "require_verification": true,
    "require_prerequisites": true,
    "require_success_metrics": false
  }
}
```

## Summary

Basic task generation transforms simple specifications into comprehensive, actionable tasks by:
1. **Identifying** core requirements
2. **Breaking down** into atomic tasks
3. **Applying** core rules and effectiveness standards
4. **Adding** all necessary context and details
5. **Ensuring** tasks are complete, clear, and testable

**Key Takeaway**: Never create bare-minimum task skeletons. Always provide comprehensive, actionable task descriptions.

