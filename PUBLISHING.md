### 4. Initialize Git Repository

```bash
# If not already initialized
cd /path/to/apacible
git init
git add .
git commit -m "Initial commit: Apacible Hugo theme v1.0.0"
```

### 5. Create GitHub Repository

1. Create a new repository on GitHub named `apacible`
2. **Do not** initialize with README, LICENSE, or .gitignore (already exists)
3. Push the theme:

```bash
git remote add origin https://github.com/YOUR_USERNAME/apacible.git
git branch -M main
git push -u origin main
```

### 6. Tag First Release

```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"
git push origin v1.0.0
```

### 7. Submit to Hugo Themes

1. Fork the Hugo Themes repository: https://github.com/gohugoio/hugoThemes
2. Add your theme as a Git submodule:
   ```bash
   git submodule add https://github.com/YOUR_USERNAME/apacible.git apacible
   ```
3. Create a pull request with:
   - Theme name
   - Brief description
   - Link to demo site (if available)

## 📝 Repository Structure

The theme now follows Hugo's standard structure:

```
apacible/                    ← Theme root (publish this)
├── archetypes/             ← Content templates
├── assets/                 ← Source CSS/JS
├── layouts/                ← HTML templates
├── static/                 ← Static assets
├── exampleSite/            ← Demo site
│   ├── content/           ← Demo content
│   ├── data/              ← Demo data
│   ├── static/            ← Demo images
│   ├── hugo.toml          ← Demo config
│   └── README.md          ← Demo instructions
├── images/                 ← Theme screenshots
│   ├── screenshot.png     ← 1500x1000px
│   └── tn.png             ← 900x600px
├── .gitignore
├── LICENSE
├── README.md              ← Main documentation
├── INSTALL.md             ← Installation guide
└── theme.toml             ← Theme metadata
```

## 🚀 Installation Instructions for Users

Users will install your theme with:

```bash
cd their-hugo-site
git submodule add https://github.com/YOUR_USERNAME/apacible.git themes/apacible
```

Then add to their `hugo.toml`:
```toml
theme = "apacible"
```

## 📚 Documentation

All documentation is included:
- **README.md** - Main theme documentation with features, shortcodes, configuration
- **INSTALL.md** - Quick installation guide
- **IMAGE_GUIDE.md** - Guide for image processing and dithering
- **exampleSite/README.md** - Demo site documentation

## 🔗 Useful Links

- Hugo Themes Repository: https://github.com/gohugoio/hugoThemes
- Hugo Theme Components: https://gohugo.io/hugo-modules/theme-components/
- Hugo Forums: https://discourse.gohugo.io/

## ✨ Optional Enhancements

Before or after publishing:

1. **Demo Site Hosting**: Host the exampleSite on Netlify/Vercel for live preview
2. **Documentation Site**: Create a dedicated docs site
3. **GitHub Actions**: Add CI/CD for building and testing
4. **Changelog**: Create CHANGELOG.md for tracking versions
5. **Contributing Guide**: Add CONTRIBUTING.md for contributors

## 📧 Support

After publishing, consider:
- Enable GitHub Issues for bug reports
- Create GitHub Discussions for Q&A
- Add a SUPPORT.md file with contact info

