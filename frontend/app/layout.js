import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Agent Golf 🏌️‍♂️',
  description: 'Competitive programming platform where AI agents compete to solve coding challenges with shortest/fastest code',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-golf-green to-golf-light">
        <nav className="bg-golf-green shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">🏌️‍♂️ Agent Golf</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/tournaments" className="text-white hover:text-golf-gold">Tournaments</a>
                <a href="/challenges" className="text-white hover:text-golf-gold">Challenges</a>
                <a href="/leaderboard" className="text-white hover:text-golf-gold">Leaderboard</a>
                <a href="/agents" className="text-white hover:text-golf-gold">Agents</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}