# Git Setup & Version Tagging Guide

All files are already staged and ready to commit!

## Step-by-Step Instructions

### 1. Commit All Files

```bash
cd /home/christian/src/my_domains/apacbilbe_hugo_theme/themes/apacible

git commit -m "Initial commit: Apacible Hugo theme v1.0.0

- Minimalist Hugo theme prioritizing accessibility and smolweb principles
- Dithered image support with lo-fi aesthetic
- Dark/Light mode with localStorage persistence
- Comprehensive shortcodes (callouts, images, galleries, collections)
- Mermaid diagrams and KaTeX math support
- Responsive design with Elder Futhark rune navigation
- Fully anonymized demo content
- MIT License"
```

### 2. Tag the Version

After committing, create an annotated tag for v1.0.0:

```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release

Features:
- Hugo-native image processing
- Dark/light theme toggle
- Accessibility-first design (WCAG compliant)
- Smolweb principles
- Collection system for organizing content
- Multiple shortcodes for rich content
- Example site with demo content
"
```

### 3. Verify

Check your commit and tag:

```bash
# View commit
git log --oneline -1

# View tags
git tag -l

# View tag details
git show v1.0.0
```

### 4. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `apacible`
3. Description: `A calm, accessible Hugo theme for the smolweb`
4. **Public** repository
5. **Do NOT** initialize with README, LICENSE, or .gitignore (already exists)
6. Click "Create repository"

### 5. Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/christiankopac/apacible.git

# Push main branch
git branch -M main
git push -u origin main

# Push tags
git push origin v1.0.0

# Or push all tags at once
git push --tags
```

### 6. Verify on GitHub

Visit your repository: https://github.com/christiankopac/apacible

You should see:
- All files committed
- v1.0.0 tag in the "Releases" section
- README displayed on the homepage

### 7. Create GitHub Release (Optional but Recommended)

1. Go to https://github.com/christiankopac/apacible/releases
2. Click "Draft a new release"
3. Choose tag: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Description:
   ```markdown
   # Apacible Hugo Theme v1.0.0
   
   First public release of the Apacible Hugo theme - a calm, accessible theme for the smolweb.
   
   ## ✨ Features
   
   - **Accessibility First**: WCAG compliant, semantic HTML
   - **Smolweb Philosophy**: Minimal JavaScript, small file sizes
   - **Hugo-Native**: Uses Hugo's built-in image processing
   - **Dark/Light Mode**: Theme persistence with localStorage
   - **Rich Shortcodes**: Callouts, galleries, collections, and more
   - **Mermaid & Math**: Built-in diagram and equation support
   - **Responsive**: Mobile-first design
   
   ## 📦 Installation
   
   ```bash
   cd your-hugo-site
   git submodule add https://github.com/christiankopac/apacible.git themes/apacible
   ```
   
   See [README.md](README.md) for full documentation.
   
   ## 🎨 Demo
   
   Check out the `exampleSite/` directory for a working demo.
   ```
6. Click "Publish release"

## Future Updates

When you make changes and want to release a new version:

```bash
# Make your changes, then:
git add .
git commit -m "Description of changes"

# Tag new version
git tag -a v1.0.1 -m "Version 1.0.1: Bug fixes and improvements"

# Push
git push origin main
git push origin v1.0.1
```

## Version Numbering (Semantic Versioning)

- **v1.0.0** → v**MAJOR**.MINOR.PATCH
- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features, backwards compatible (v1.1.0)
- **PATCH**: Bug fixes (v1.0.1)

## Submit to Hugo Themes Showcase

After pushing to GitHub:

1. Fork https://github.com/gohugoio/hugoThemes
2. Clone your fork
3. Add your theme as a submodule:
   ```bash
   git submodule add https://github.com/christiankopac/apacible.git apacible
   ```
4. Commit and create a pull request
5. Hugo team will review and merge

---

**Note**: Remember to replace placeholder screenshots in `images/` before pushing!

