# Image Processing Guide for Apacible Hugo Theme

This guide explains how to use the image processing system with dithered images in the Apacible Hugo theme.

## Overview

The theme supports:
- ✅ **WebP format** (modern, efficient)
- ✅ **AVIF** (only when you provide a pre-converted `.avif` next to the source in `assets/`; Hugo does not encode AVIF)
- ✅ **Dithered images** (lo-fi aesthetic using Hugo's native `images.Dither`)
- ✅ **Toggle to original** (via button in caption)
- ✅ **Lazy loading** (performance)
- ✅ **Automatic dithering** with the `dithered` shortcode (no pre-dithered files needed)

## Quick Start

### 1. Place Images

Put images in one of these locations:
- `assets/` - Processed by Hugo (recommended)
- `static/` - Served as-is (for pre-processed images)
- `content/made/` - Page-relative images

### 2. Use in Content

#### Basic Image
```markdown
{{< img src="assets/trees.jpg" alt="A forest scene" caption="A beautiful forest" >}}
```

#### Dithered Image (Automatic)
The `dithered` shortcode automatically creates a dithered version using Hugo's native image processing:

```markdown
{{< dithered src="assets/trees.jpg" alt="A forest scene" caption="A dithered forest scene with toggle" >}}
```

**No pre-processing needed!** Hugo generates the dithered version during build.

## Shortcode Reference

### `img` - Standard Image Shortcode

**Parameters:**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `src` | Yes | - | Path to image |
| `alt` | Yes | - | Alt text for accessibility |
| `caption` | No | - | Figure caption |
| `width` | No | 800 | Target width in pixels |
| `height` | No | 600 | Target height in pixels |
| `op` | No | "fit" | Resize operation: "resize", "fit", "fill" |
| `quality` | No | 85 | JPEG/WebP quality (1-100) |
| `dithered` | No | false | Use pre-dithered version (requires `_dithered.jpg` file) |
| `show_original` | No | true | Show toggle link (for dithered) |

**Examples:**

```markdown
<!-- Standard image -->
{{< img src="assets/trees.jpg" alt="A forest scene" caption="A beautiful forest" >}}

<!-- Custom size -->
{{< img src="assets/trees.jpg" alt="A forest scene" width="1200" height="800" op="fit" >}}

<!-- High quality -->
{{< img src="assets/trees.jpg" alt="A forest scene" quality="95" >}}

<!-- With pre-dithered file (legacy) -->
{{< img src="assets/trees.jpg" alt="A forest scene" caption="Click to toggle" dithered="true" >}}
```

### `dithered` - Dithered Image Shortcode (Recommended)

This shortcode automatically creates dithered images using Hugo's native `images.Dither` filter. **No pre-processing required!**

**Parameters:**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `src` | Yes | - | Path to source image |
| `alt` | Yes | - | Alt text for accessibility |
| `caption` | No | - | Figure caption (toggle appears here) |
| `width` | No | 800 | Target width in pixels |
| `height` | No | 600 | Target height in pixels |
| `quality` | No | 85 | JPEG/WebP quality (1-100) |
| `show_original` | No | true | Show toggle button to view original |

**Examples:**

```markdown
<!-- Dithered with toggle (default) -->
{{< dithered src="assets/trees.jpg" alt="A forest scene" caption="A dithered forest scene" >}}

<!-- Dithered without toggle -->
{{< dithered src="assets/trees.jpg" alt="A forest scene" caption="Dithered only" show_original="false" >}}

<!-- Custom size -->
{{< dithered src="assets/trees.jpg" alt="A forest scene" width="1200" caption="Large dithered image" >}}

<!-- No caption, no toggle -->
{{< dithered src="assets/trees.jpg" alt="A forest scene" show_original="false" >}}
```

**How it works:**
1. Hugo loads the source image
2. Resizes it to the specified width (preserving aspect ratio)
3. Converts to grayscale
4. Applies Floyd-Steinberg dithering with a 5-color grayscale palette
5. Generates optimized WebP versions (plus a pre-converted `.avif` sibling, if one exists)
6. Creates a toggle button in the caption (if enabled)

### `img_compare` - Side-by-Side Comparison

Display dithered and original side-by-side.

**Parameters:**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `src` | Yes | - | Path to image |
| `alt` | Yes | - | Alt text |
| `caption` | No | - | Overall caption |
| `width` | No | 800 | Target width |
| `height` | No | 600 | Target height |
| `op` | No | "fit" | Resize operation |
| `quality` | No | 75 | Quality (1-100) |

**Example:**

```markdown
{{< img_compare src="assets/trees.jpg" alt="Forest scene comparison" caption="Dithering Effect" >}}
```

### `gallery` - Image Grid with Lightbox

Display grid of images with lightbox.

**Parameters:**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `file` | Yes | - | Data file name (in `data/`) |
| `columns` | No | 3 | Number of columns |
| `thumb_width` | No | 300 | Thumbnail width |
| `thumb_height` | No | 200 | Thumbnail height |
| `full_width` | No | 2400 | Full image width |
| `full_height` | No | 1600 | Full image height |

**Example:**

```markdown
{{< gallery file="my-gallery.toml" columns="3" >}}
```

**Data file** (`data/my-gallery.toml`):

```toml
[[images]]
src = "/assets/image1.jpg"
alt = "Description"
caption = "Optional caption"

[[images]]
src = "/assets/image2.jpg"
alt = "Description"
caption = "Another photo"
```

## Image Locations

### Assets Directory (Recommended)

```
assets/
  images/
    trees.jpg
```

Usage:
```markdown
{{< dithered src="images/trees.jpg" alt="A forest scene" caption="A dithered forest scene" >}}
```

Hugo processes these at build time and generates the dithered version automatically.

### Static Directory

```
static/
  images/
    icon.png
```

Usage:
```markdown
{{< img src="images/icon.png" alt="Icon" >}}
```

Files served as-is, no Hugo processing. For dithered images, use `assets/` instead.

### Page Resources

```
content/made/my-post/
  index.md
  image.jpg
```

Usage in `my-post/index.md`:
```markdown
{{< dithered src="image.jpg" alt="Local image" caption="Post image" >}}
```

## Resize Operations

### fit (default)
Fits within dimensions, preserves aspect ratio:
```markdown
{{< img src="assets/trees.jpg" alt="A forest scene" width="800" height="600" op="fit" >}}
```

### resize
Resizes to exact dimensions (may distort):
```markdown
{{< img src="assets/trees.jpg" alt="A forest scene" width="800" height="600" op="resize" >}}
```

### fill
Crops to exact dimensions:
```markdown
{{< img src="assets/trees.jpg" alt="A forest scene" width="800" height="600" op="fill" >}}
```

## Dithering Effect

The `dithered` shortcode uses Hugo's native `images.Dither` filter with:

- **Method**: Floyd-Steinberg (smooth, high-quality dithering)
- **Palette**: 5-color grayscale (`#1a1a1a`, `#4d4d4d`, `#808080`, `#b3b3b3`, `#e6e6e6`)
- **Strength**: 0.9 (strong but not harsh)
- **Serpentine**: Enabled (alternating scan direction for better quality)
- **Blend mode**: `multiply` (CSS) for better integration with page background

Result: Smooth, high-contrast black & white lo-fi aesthetic with a toggle to view the original.

## Build Process

The dithered images are generated automatically during Hugo's build process:

1. **Development**: `hugo server` - Images processed on-demand
2. **Production**: `hugo --minify` - All images processed and optimized

No additional scripts or pre-processing required!

## Workflow

1. **Add images** to your content/assets:
   ```bash
   cp trees.jpg assets/images/
   ```

2. **Use in markdown**:
   ```markdown
   {{< dithered src="images/trees.jpg" alt="A forest scene" caption="A beautiful forest" >}}
   ```

3. **Build site**:
   ```bash
   hugo --minify
   ```

That's it! Hugo handles the dithering automatically.

## Troubleshooting

### Image not found

- Check path is correct (relative to `assets/`, `static/`, or page)
- For `assets/`, path should not include `/assets/` prefix
- Ensure the image file exists

### Dithered version not showing

- Verify you're using the `dithered` shortcode (not `img` with `dithered="true"`)
- Check that Hugo Extended is installed (required for image processing)
- Ensure the source image is in `assets/` (not `static/`)

### Hugo Extended not found

Install Hugo Extended:
```bash
# macOS
brew install hugo

# Linux (snap)
snap install hugo --channel=extended

# Or download from: https://github.com/gohugoio/hugo/releases
```

## Performance Tips

1. **Appropriate sizes**: Don't use 4K images for thumbnails
2. **WebP compression**: Already optimized in shortcodes
3. **Lazy loading**: Enabled by default in shortcodes
4. **Build caching**: Hugo caches processed images

## Examples

See the theme demo for live examples:
- Standard images
- Dithered images with toggle
- Image comparisons
- Gallery grids

## Format Support

| Format | Support | Notes |
|--------|---------|-------|
| WebP | ✅ Yes | Auto-generated, with fallback |
| AVIF | ✅ Optional | Used only if a pre-converted `.avif` sibling exists in `assets/` |
| JPEG | ✅ Yes | Fallback format |
| PNG | ✅ Yes | For graphics with transparency |

## Browser Support

- Modern browsers: Full support (WebP/AVIF + lazy loading)
- Older browsers: Fallback to JPEG/PNG
- No JavaScript: Images still display (toggle requires JS)

## CSS Styling

Dithered images use `mix-blend-mode: multiply` for better visual integration:

```css
.dithered-img {
  mix-blend-mode: multiply;
}

@media (prefers-color-scheme: dark) {
  .dithered-img {
    mix-blend-mode: screen; /* Better for dark backgrounds */
  }
}
```

This ensures dithered images blend naturally with your page background.

