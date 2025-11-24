# Apacible Hugo Theme

> good-tempered, calm, pleasant

A minimalist Hugo theme prioritizing accessibility and smolweb principles, with unique dithered image support.

## Features

### Core Features
- ✅ **Smolweb-focused**: Small, fast, accessible
- 🎨 **Dithered images**: Lo-fi aesthetic with toggle to original
- 🌓 **Dark mode**: Automatic theme switching with localStorage
- 📝 **Blog-ready**: Post listings, tags, categories
- 📑 **Substack-style TOC**: Click-to-expand table of contents with scroll highlighting
- 🎯 **Collections**: Flexible content display system
- 📊 **Mermaid diagrams**: Built-in diagram support
- 🔢 **KaTeX math**: Mathematical notation support
- 🏠 **Personal homepage**: Elegant layout with social links and bio
- 💥 **Animated 404**: Playful error page with floating runes
- 📱 **Responsive**: Mobile-first design
- ♿ **Accessible**: WCAG compliant

### Advanced Features
- 🌐 **Gemini Protocol**: Full support for Gemini capsule export (`.gmi` templates for all page types)
- 📬 **Newsletter Templates**: Generate HTML newsletter content for picks and posts
- 📚 **Consumed Content**: Track and display books, movies, music with ratings and reviews
- 💬 **Giscus Integration**: Custom themed comment system
- 🌍 **Multilingual**: i18n support (English and Spanish included)

## Installation

1. Add as a Git submodule:
```bash
cd your-hugo-site
git submodule add https://git.sr.ht/~ckopac/apacible themes/apacible
```

2. Update your `hugo.toml`:
```toml
theme = "apacible"
```

3. Copy the example config from `themes/apacible/exampleSite/hugo.toml` to your site root.

## Quick Start

### 1. Create your home page

Create `content/_index.md`:

```markdown
+++
title = "Home"

[params]
name = "Your Name"
bio = "Your bio here"
avatar = ""  # Leave empty for default avatar

[[params.links]]
name = "GitHub"
url = "https://github.com/yourusername"
icon = "github"

[[params.links]]
name = "Email"
url = "mailto:you@example.com"
icon = "email"

[[params.links]]
name = "Bluesky"
url = "https://bsky.app/profile/yourhandle"
icon = "bluesky"

# Supported icons: github, email, bluesky, twitter, mastodon, twitch, instagram, linkedin

recent = true
recent_max = 5
recent_more_text = "View all posts →"
+++
```

### 2. Create your first post

```bash
hugo new posts/my-first-post.md
```

### 3. Add images

Place images in the `assets/` directory and use the image shortcodes:

```markdown
{{< img src="assets/photo.jpg" alt="My photo" caption="A dithered photo" dithered="true" >}}
```

Hugo will automatically process and optimize your images.

### 4. Build and serve

```bash
# Development server
hugo server -D

# Production build
hugo --minify
```

## Advanced Features

### Gemini Protocol Support

The theme includes full Gemini protocol support with `.gmi` templates for all page types:

- Homepage with bio and navigation
- Post listings and individual posts
- Tag and category pages
- Collections and consumed content
- Automatic "Web version" links

All Gemini templates use your site's `baseURL` configuration, making them portable across domains.

### Newsletter Generation

Generate newsletter-ready HTML for email campaigns:

**Monthly Picks Newsletter:**
```bash
hugo --renderToMemory --renderStaticToDisk=false \
  --baseURL="http://localhost:1313" \
  -d public
# Access: http://localhost:1313/picks/list.newsletter.html
```

**New Posts Newsletter:**
```bash
# Access: http://localhost:1313/posts/list.newsletter.html
```

The templates filter content by current month and generate copy-paste ready HTML for platforms like Substack or Buttondown.

### Consumed Content Tracking

Track books, movies, and music you've consumed in `data/consumed.toml`:

```toml
[[collection]]
title = "Book Title"
author = "Author Name"
category = "books"
year = "2024"
rating = 4.5
date_read = "2024-11"
content = "Your thoughts here..."
review = "Detailed review..."
```

Create a `consumed` section to display your media consumption with ratings, dates, and reviews.

## Documentation

For detailed documentation on:
- Image processing and shortcodes
- Configuration options
- Collections system
- Customization

See the [full documentation](PUBLISHING.md) or explore the `exampleSite/` directory.

## Demo

Check out the `exampleSite/` directory for a complete working demo with:
- Example blog posts
- Collections showcase
- All shortcode examples
- Custom configurations

To run the example site:

```bash
cd exampleSite
hugo server --themesDir ../..
```

## Requirements

- Hugo v0.100.0 or later
- Hugo Extended version (for image processing)

## Smolweb Compliance

This theme adheres to smolweb principles:

- ✅ No tracking or analytics
- ✅ No external dependencies (except CDN for math/diagrams)
- ✅ Minimal JavaScript (progressive enhancement)
- ✅ Semantic HTML
- ✅ Small file sizes
- ✅ Works without JavaScript
- ✅ Accessible (WCAG AA)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for older browsers
- WebP with fallback to JPEG/PNG
- Works without JavaScript (with degraded UX)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Theme design: Christian Kopac
- Diagrams: [Mermaid](https://mermaid.js.org/)
- Math: [KaTeX](https://katex.org/)
