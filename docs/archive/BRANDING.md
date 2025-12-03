# 🎨 QA Nexus Branding Guide

This document explains how to customize the branding of your QA Nexus installation.

## Logo and Favicon Assets

### Required Files

Place the following image files in the `public/` directory:

1. **`public/icon.png`** (Required)
   - Main application icon
   - Used in: Sidebar logo, browser favicon
   - Recommended size: 512x512px or larger
   - Format: PNG with transparency

2. **`public/icon-16x16.png`** (Optional but recommended)
   - Small favicon for browser tabs
   - Size: Exactly 16x16px
   - Format: PNG

3. **`public/icon-32x32.png`** (Optional but recommended)
   - Medium favicon for browser tabs and bookmarks
   - Size: Exactly 32x32px
   - Format: PNG

4. **`public/apple-icon.png`** (Optional)
   - Apple touch icon for iOS home screen
   - Recommended size: 180x180px
   - Format: PNG

### Where These Files Are Used

#### Sidebar Logo
- **File**: `src/components/layout/sidebar.tsx`
- **Lines**: 73-90
- **Usage**:
  ```tsx
  <img src="/icon.png" alt="QA Nexus" className="h-8 w-8" />
  ```

#### Browser Favicon
- **File**: `src/app/layout.tsx`
- **Lines**: 21-30
- **Usage**: Configured in Next.js metadata
  ```tsx
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png' }],
  }
  ```

## Quick Start: Adding Your Logo

### Option 1: From Uploaded Images

If you have the QA Nexus logo files from the design team:

1. Save the full logo icon to `public/icon.png`
2. Create different sizes using an image editor:
   ```bash
   # Using ImageMagick (if installed)
   convert public/icon.png -resize 16x16 public/icon-16x16.png
   convert public/icon.png -resize 32x32 public/icon-32x32.png
   convert public/icon.png -resize 180x180 public/apple-icon.png
   ```
3. Restart the development server
4. The logos will appear immediately in the sidebar and browser tab

### Option 2: Create Your Own

1. Design your logo in your preferred tool (Figma, Photoshop, etc.)
2. Export as PNG with transparent background
3. Save to `public/icon.png` (512x512px recommended)
4. Create smaller versions for favicons
5. Restart the development server

## Design Guidelines

### Logo Icon Design

- **Style**: Modern, minimal, professional
- **Colors**: Use brand colors (primary: blue, accent: green/teal)
- **Shape**: Square canvas with centered icon
- **Padding**: Leave 10-15% padding around the icon
- **Transparency**: Use transparent background for best results

### QA Nexus Brand Colors

Default colors used in the application:

- **Primary**: `#0066FF` (Blue)
- **Primary Dark**: `#0052CC`
- **Accent**: `#00C896` (Teal/Green)
- **Background**: `#FFFFFF` (Light mode), `#0A0A0A` (Dark mode)
- **Text**: `#171717` (Light mode), `#FAFAFA` (Dark mode)

## Troubleshooting

### Logo Not Appearing

1. **Check file exists**: Verify `public/icon.png` exists
2. **Check file path**: Must be in `public/` directory (not `src/public/`)
3. **Restart server**: Changes to public folder may require restart
4. **Clear cache**: Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
5. **Check console**: Look for 404 errors in browser console

### Logo Looks Blurry

- Use higher resolution source image (512x512px or larger)
- Export as PNG (not JPG) to avoid compression artifacts
- Ensure the image has good contrast

### Favicon Not Updating

- Clear browser cache completely
- Close and reopen browser
- Check if you're using the correct sizes (16x16, 32x32)
- Wait a few minutes - browsers can cache favicons aggressively

## Current Status

As of this commit:
- ✅ Logo references updated in `src/components/layout/sidebar.tsx`
- ✅ Favicon configuration added to `src/app/layout.tsx`
- ⏳ **Action Required**: Place your logo image files in `public/` directory

The application is ready to use your branding - just add the image files!

## Example Logo Specifications

### Recommended Export Settings

```
Format: PNG
Color Mode: RGBA (with transparency)
Bit Depth: 8-bit

icon.png:        512×512px
icon-16x16.png:  16×16px
icon-32x32.png:  32×32px
apple-icon.png:  180×180px
```

## Advanced: Full Logo with Text

If you want to use a full logo with text in the sidebar (instead of just an icon + text):

1. Create a wide logo image (e.g., 200×50px)
2. Save to `public/logo-full.png`
3. Update `sidebar.tsx` line 73-80:
   ```tsx
   <img
     src="/logo-full.png"
     alt="QA Nexus"
     className="h-8"
   />
   ```
4. Remove the text span if using full logo with text

---

**Note**: This file was created to document the branding structure. The actual logo files from the user upload need to be manually placed in the `public/` directory.
