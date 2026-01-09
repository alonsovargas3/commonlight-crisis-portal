import type { Metadata } from "next";
import "./globals.css";
import { CrisisTopBar } from "@/components/crisis/CrisisTopBar";

export const metadata: Metadata = {
  title: "CommonLight Crisis Portal",
  description: "Find mental health resources quickly and accurately",
};

/**
 * Crisis Worker Portal Root Layout
 *
 * Key features:
 * - NO sidebar navigation
 * - Simple top bar with logo, location, help, profile
 * - Clean, focused interface for crisis workers
 * - Authentication handled by Clerk (configure via middleware)
 *
 * Note: ClerkProvider is not needed in layout when using middleware.
 * See: https://clerk.com/docs/quickstarts/nextjs
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
          {/* Skip to main content link for accessibility */}
          <a
            href="#crisis-main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-blue-400"
          >
            Skip to main content
          </a>

          {/* Top Bar - Always visible, no sidebar */}
          <CrisisTopBar />

          {/* Main Content Area */}
          <main
            id="crisis-main-content"
            role="main"
            aria-label="Crisis worker portal main content"
            className="flex-1"
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
