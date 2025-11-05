# Deployment Guide - CFO AI Cockpit

## Quick Deploy Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

**Build Settings:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### Option 2: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 3: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update vite.config.js to include base path:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/cfo-ai-cockpit/', // Replace with your repo name
})
```

4. Deploy:
```bash
npm run deploy
```

### Option 4: Traditional Web Server

1. Build the application:
```bash
npm run build
```

2. Copy the `dist` folder to your web server
3. Configure server to serve `index.html` for all routes (SPA mode)

**Nginx example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache example (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Environment Configuration

This application uses a static JSON file (`public/data.json`) for data, so no environment variables are needed for the MVP.

For future production versions with API integration:

1. Create `.env` file:
```
VITE_API_URL=https://your-api.com
VITE_API_KEY=your-api-key
```

2. Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## Performance Optimization

For production deployments, consider:

1. **Code Splitting:** Implement dynamic imports for components
2. **Image Optimization:** Use optimized formats (WebP, AVIF)
3. **CDN:** Serve static assets from a CDN
4. **Caching:** Configure proper cache headers
5. **Compression:** Enable Gzip/Brotli compression

## Monitoring

Add monitoring tools for production:

- **Analytics:** Google Analytics, Plausible, or Fathom
- **Error Tracking:** Sentry, LogRocket, or Rollbar
- **Performance:** Lighthouse CI, SpeedCurve

## Security Considerations

- [ ] Enable HTTPS (required for production)
- [ ] Set proper CORS headers if using API
- [ ] Implement CSP (Content Security Policy)
- [ ] Regular dependency updates: `npm audit fix`

## CI/CD Pipeline

Example GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Troubleshooting

### Build fails with memory error
Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Routes not working after deployment
Ensure your server is configured for SPA routing (see server configs above)

### Blank page after deployment
Check browser console for errors. Common issues:
- Incorrect base path in vite.config.js
- CORS issues if fetching external data
- Missing environment variables

## Support

For issues specific to this application, refer to:
- README.md for general information
- PRD document for feature specifications
- GitHub Issues (if repository is public)
