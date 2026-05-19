import { useState } from "react";
import Contain from "./contain";
import Link from "next/link";
import { cmsFileUrl } from "@/helpers/helpers";

export default function HeaderComponent({ siteSettings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMoreDropdownOpen, setMobileMoreDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const openMoreDropdown = () => {
    setMoreDropdownOpen(true);
  };

  const closeMoreDropdown = () => {
    setMoreDropdownOpen(false);
  };

  const toggleMobileMoreDropdown = () => {
    setMobileMoreDropdownOpen(!mobileMoreDropdownOpen);
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
            <button
              className="nav__more"
              aria-haspopup="true"
              aria-expanded={moreDropdownOpen}
              onMouseEnter={openMoreDropdown}
              onMouseLeave={closeMoreDropdown}
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
              <div
                className={`nav__more-dropdown ${moreDropdownOpen ? "is-open" : ""}`}
                onMouseEnter={openMoreDropdown}
                onMouseLeave={closeMoreDropdown}
              >
                <Link href="/faq" className="nav__dropdown-link">
                  FAQ's
                </Link>
                <Link href="/contact" className="nav__dropdown-link">
                  Contact Us
                </Link>
                <Link href="/appointment-tips" className="nav__dropdown-link">
                  Appointment Tips
                </Link>
              </div>
            </button>
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
        <button
          className="nav__mobile-more"
          aria-expanded={mobileMoreDropdownOpen}
          onClick={toggleMobileMoreDropdown}
        >
          More
          <svg
            className="nav__mobile-more-chevron"
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
        </button>
        <div
          className={`nav__mobile-more-dropdown ${mobileMoreDropdownOpen ? "is-open" : ""}`}
        >
          <Link
            href="/faq"
            className="nav__mobile-dropdown-link"
            onClick={closeMobileMenu}
          >
            FAQ's
          </Link>
          <Link
            href="/contact"
            className="nav__mobile-dropdown-link"
            onClick={closeMobileMenu}
          >
            Contact Us
          </Link>
          <Link
            href="/appointment-tips"
            className="nav__mobile-dropdown-link"
            onClick={closeMobileMenu}
          >
            Appointment Tips
          </Link>
        </div>
        <Link href="/steps" className="nav__mobile-cta">
          Get my Offer
        </Link>
      </nav>
    </header>
  );
}
