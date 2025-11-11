# Apacible Theme - Example Site

This is the demo site for the **apacible** Hugo theme.

## Quick Start

```bash
# From the exampleSite directory
hugo server --themesDir ../..

# Or with drafts
hugo server --themesDir ../.. -D
```

## What's Included

This demo showcases:

- **Blog posts** with syntax highlighting, Mermaid diagrams, and math support
- **Collections** for organizing media consumption (books, movies, music)
- **Dithered images** with lo-fi aesthetic
- **Dark/Light mode** with theme persistence
- **Responsive design** optimized for mobile and desktop
- **Elder Futhark runes** for semantic navigation

## Demo Content

- **Music**: Classic 70s Argentinian rock albums
- **Movies**: Peaceful and calm-themed films
- **Books**: Lorem ipsum placeholder content
- **Blog Posts**: Example posts showcasing various theme features

All content is **CC0 (Public Domain)** and meant for demonstration purposes.

## Customization

To use this theme for your own site:

1. Copy the theme to your Hugo site's `themes/` directory
2. Update `hugo.toml` with your site information
3. Replace demo content with your own
4. Customize colors in `themes/apacible/static/css/theme.css`

See the main [theme README](../README.md) for full documentation.

## Building

```bash
# Development server
hugo server --themesDir ../..

# Production build
hugo --themesDir ../.. --minify
```

## Requirements

- Hugo v0.100.0 or later (with extended version for image processing)

## License

Theme: MIT License  
Demo Content: CC0 (Public Domain)
