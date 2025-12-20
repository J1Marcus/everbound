import { Link, useLocation } from 'react-router-dom'
import './MobileBottomNav.css'

interface NavItem {
  path: string
  icon: string
  label: string
}

interface MobileBottomNavProps {
  items: NavItem[]
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
  const location = useLocation()

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const isActive = location.pathname === item.path || 
                        location.pathname.startsWith(item.path + '/')
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="mobile-nav-icon" role="img" aria-hidden="true">
              {item.icon}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
