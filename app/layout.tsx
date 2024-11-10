import '@/styles/main.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - Cinkbert',
    default: 'Cinkbert - Close every deal',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      
      
      </head>
      <body className="text-black ">
    
        {children}
      
      </body>
    </html>
  )
}
