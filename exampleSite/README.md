# Apacible Theme — Example Site

The demo site for the **apacible** Hugo theme: home (hero, explore index,
Lately river), `made` posts, `margins` (movie/music/book), `picks`,
`playlists` and `found`, plus about/now/privacy for the footer index.

## Run it

The theme bundles swup page transitions with Hugo's `js.Build`, so install
the npm packages first (`node_modules/` is git-ignored):

```bash
# From this directory, with the theme repo checked out as ../
npm install
hugo server --themesDir ../.. --theme apacible-hugo-theme

# Production build
hugo --themesDir ../.. --theme apacible-hugo-theme
```

`hugo.toml` says `theme = "apacible"` (the name used when the theme is a
submodule at `themes/apacible`); `--theme apacible-hugo-theme` points it at
this checkout instead.

## Use it for your own site

1. `git submodule add https://github.com/christiankopac/apacible-hugo-theme themes/apacible`
2. Copy `hugo.toml` and `package.json` to your site root; run `npm install`.
3. Edit `[params]` (name, footer, social, home_nav…) and replace the content.

See the [theme README](../README.md) for every option.

## License

Theme: MIT. Demo content: CC0 (public domain).
