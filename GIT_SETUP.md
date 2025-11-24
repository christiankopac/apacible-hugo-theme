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

### 4. Create sourcehut Repository

1. Go to https://git.sr.ht/
2. Click "Create a new repository"
3. Repository name: `apacible`
4. Description: `A calm, accessible Hugo theme for the smolweb`
5. **Public** repository
6. Click "Create repository"

### 5. Push to sourcehut

```bash
# Add remote
git remote add origin https://git.sr.ht/~ckopac/apacible

# Push main branch
git branch -M main
git push -u origin main

# Push tags
git push origin v1.0.0

# Or push all tags at once
git push --tags
```

### 6. Verify on sourcehut

Visit your repository: https://git.sr.ht/~ckopac/apacible

You should see:
- All files committed
- v1.0.0 tag in the refs section
- README displayed on the homepage

### 7. Create Release Notes (Optional but Recommended)

You can create release notes by:
1. Go to https://git.sr.ht/~ckopac/apacible
2. View the tag: `v1.0.0`
3. Create a post or update README with release information

Release notes template:
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
git submodule add https://git.sr.ht/~ckopac/apacible themes/apacible
   ```
   
   See [README.md](README.md) for full documentation.
   
   ## 🎨 Demo
   
   Check out the `exampleSite/` directory for a working demo.
   ```

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

After pushing to sourcehut:

1. Fork https://github.com/gohugoio/hugoThemes
2. Clone your fork
3. Add your theme as a submodule:
   ```bash
   git submodule add https://git.sr.ht/~ckopac/apacible apacible
   ```
4. Commit and create a pull request
5. Hugo team will review and merge

---

**Note**: Remember to replace placeholder screenshots in `images/` before pushing!

