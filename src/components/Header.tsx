import { BRAND } from '../config'
import logo from '../assets/c-print.png'

export function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <img src={logo} alt="C-Print" width={40} height={40} />
      </div>
      <div className="header-meta">
        <span className="header-name">{BRAND.name}</span>
        <span className="header-status">
          <span className="dot" aria-hidden="true" />
          Trực tuyến · {BRAND.role}
        </span>
      </div>
    </header>
  )
}
