# Vercel Deployment Guide

This document provides instructions and troubleshooting steps for deploying the BD TicketPro application to Vercel.

## Deployment Configuration

The application is configured for deployment to Vercel with the following settings in `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/spa"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Key Configuration Points

### 1. Build Process
- Uses `@vercel/static-build` to build the application
- Output directory is set to `dist/spa` to match Vite's build output
- The build command is automatically detected from package.json (`vite build`)

### 2. Routing Configuration
- SPA routing is handled with a catch-all route that directs all requests to `/index.html`
- This ensures client-side routing works correctly with React Router

### 3. Base Path Configuration
In `vite.config.ts`, the base path is set to `"./"`:
```ts
export default defineConfig({
  base: "./",
  // ... other configuration
})
```

This ensures that all assets are referenced with relative paths, which is crucial for proper functioning on Vercel.

## Common Issues and Solutions

### 1. Homepage Not Loading
**Problem**: The homepage or other routes show a 404 error or blank page.
**Solution**: 
- Ensure the `routes` configuration in `vercel.json` is properly set up with a catch-all route
- Verify that the `base` path in `vite.config.ts` is set to `"./"` (relative path)
- Check that the build output directory matches the `distDir` in `vercel.json`

### 2. Missing Assets
**Problem**: CSS, JavaScript, or image assets are not loading.
**Solution**:
- Confirm that all asset paths in the built HTML files are relative (starting with `./`)
- Ensure favicon.ico exists in the project root or is properly handled in the HTML
- Check the build output in `dist/spa` to verify asset structure

### 3. Routing Issues
**Problem**: Navigation between pages doesn't work or shows 404 errors.
**Solution**:
- Verify that the catch-all route `{ "src": "/(.*)", "dest": "/index.html" }` is present in `vercel.json`
- Check that React Router is properly configured in the application
- Ensure the application uses `BrowserRouter` (not `HashRouter`) for routing

## Deployment Steps

1. Push your code to the GitHub repository connected to Vercel
2. Vercel will automatically detect the project and start building
3. Monitor the build logs in the Vercel dashboard for any errors
4. Once the build completes successfully, the application will be deployed

## Testing Locally

To test the Vercel build process locally:

1. Run `npm run build` to generate the production build
2. Run `npm run preview` to serve the built files locally
3. Verify that all routes and assets work correctly

## Environment Variables

If your application requires environment variables:

1. Set them in the Vercel project settings under "Environment Variables"
2. Reference them in your code using `import.meta.env.VITE_VARIABLE_NAME`
3. Add them to `.env.example` for documentation purposes

## Troubleshooting Checklist

- [ ] `vercel.json` is properly configured with build and routes settings
- [ ] `vite.config.ts` has `base: "./"` for relative asset paths
- [ ] All routes are handled by the catch-all rule in `vercel.json`
- [ ] Favicon.ico exists in the project root
- [ ] Build completes successfully with `npm run build`
- [ ] Local preview works with `npm run preview`
- [ ] GitHub repository is properly connected to Vercel

## Support

If you continue to experience deployment issues:
1. Check the Vercel build logs for specific error messages
2. Verify that all configuration files match the specifications above
3. Ensure your Vercel project settings align with this configuration