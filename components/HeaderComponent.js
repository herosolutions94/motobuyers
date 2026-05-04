import { useState } from "react";
import Contain from "./contain";
import Link from "next/link";
import { cmsFileUrl } from "@/helpers/helpers";

export default function HeaderComponent({ siteSettings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <Contain>
        <nav className="nav" role="navigation" aria-label="Main navigation">
          <div className="nav__logo">
            <Link href="/">
              <img
                src={cmsFileUrl(siteSettings?.site_logo)}
                alt={siteSettings?.site_name}
              />
            </Link>
          </div>

          <div className="nav__links" role="list">
            <Link href="/how-it-works" className="nav__link" role="listitem">
              How It Works
            </Link>
            <Link
              href="/compare-moto-buyers"
              className="nav__link"
              role="listitem"
            >
              Compare Moto Buyers
            </Link>
            {/* <button
              className="nav__more"
              aria-haspopup="true"
              aria-expanded="false"
            >
              More
              <svg
                className="nav__more-chevron"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <polyline
                  points="6 9 12 15 18 9"
                  stroke="#000"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button> */}
          </div>
          <Link href="/steps" className="nav__cta" role="button">
            Get my Offer
          </Link>

          <button
            className="nav__hamburger"
            id="hamburger"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </Contain>

      <nav
        className={`nav__mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}
        id="mobile-menu"
        aria-label="Mobile navigation"
      >
        <Link
          href="/how-it-works"
          className="nav__mobile-link"
          onClick={closeMobileMenu}
        >
          How It Works
        </Link>
        <Link
          href="/compare-moto-buyers"
          className="nav__mobile-link"
          onClick={closeMobileMenu}
        >
          Compare Moto Buyers
        </Link>
        {/* <a href="#" className="nav__mobile-link" onClick={closeMobileMenu}>
          More
        </a> */}
        <Link href="/steps" className="nav__mobile-cta">
          Get my Offer
        </Link>
      </nav>
    </header>
  );
}
