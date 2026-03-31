# Pablo Céspedes Castro — portfolio site

Static HTML + Tailwind (built CSS) + a small amount of JavaScript.

## Local preview

Serve the folder over HTTP (some features behave better than opening `index.html` as a file):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## CSS build (Tailwind)

After changing classes in `index.html` / `*.js` or styles in `src/input.css`, regenerate the stylesheet:

```bash
npm install
npm run build:css
```

This writes `assets/main.css`. Commit that file when you deploy so the site works even without running Node on the server.

During development you can run `npm run watch:css` to rebuild on save.

## Deploy checklist

1. **Canonical & social previews** — In `index.html` inside `<head>`, find-replace `https://example.com` with your real public URL (no trailing slash) in:
   - `<link rel="canonical" …>`
   - `og:url`, `og:image`
   - `twitter:image`
   - The `application/ld+json` block (`url`, `image`)

2. **Formspree** — The contact form uses `data-form-endpoint` on `#contact-form`. Update it if you create a new form.

3. **CV** — `Download CV` points to `PabloCespedesCastro.pdf` in the site root; keep that file in place or update the `href`s.
