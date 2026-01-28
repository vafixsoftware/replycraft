import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReplyCraft - AI Customer Reviews",
  description: "Turn haters into fans with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
      appearance={{
        elements: {
          footer: "hidden" // Asta ascunde "Secured by Clerk"
        }
      }}
    >
      <html lang="en">
        <body className={inter.className}>
            {children}
        </body>
      </html>
    </ClerkProvider>
  );
}