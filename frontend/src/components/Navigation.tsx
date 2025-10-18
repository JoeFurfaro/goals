import { Link, useLocation } from 'react-router-dom'
import { Target, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-6 h-16">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium",
              location.pathname === '/'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Target className="h-5 w-5" />
            <span>My Goals</span>
          </Link>
          <Link
            to="/manage"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium",
              location.pathname === '/manage'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span>Manage Goals</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
