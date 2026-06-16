import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Retail Insights Hub',
  description: 'Lemme retail performance dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center gap-6">
            <span className="text-lg font-bold text-teal-700 tracking-tight">Lemme</span>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/weekly-report"
              className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors"
            >
              Weekly Report
            </Link>
          </div>
        </nav>
        <main className="max-w-screen-xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  )
}
