export const metadata = {
  title: 'Clarté',
  description: 'Services de nettoyage professionnels',
}

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning is required — next-themes modifies class on server vs client
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
