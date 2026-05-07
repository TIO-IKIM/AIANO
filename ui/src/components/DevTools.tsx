// DevTools component - only rendered in development
// Devtools packages are in devDependencies, so they won't be available in production builds

export function DevTools() {
  // Never render devtools in production builds
  // import.meta.env.PROD is set by Vite based on build mode
  if (import.meta.env.PROD) {
    return null;
  }

  // In development, devtools packages are available
  // Using require() with try-catch to handle cases where packages might not be available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ReactQueryDevtools } = require('@tanstack/react-query-devtools');
    // Use the new package name as recommended by the deprecation warning
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TanStackRouterDevtools } = require('@tanstack/react-router-devtools');

    return (
      <>
        <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
        <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
      </>
    );
  } catch {
    // Devtools packages not available (production build or not installed)
    return null;
  }
}
