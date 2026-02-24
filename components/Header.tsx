"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();

  const navItem = (href: string, label: string) => {
    const active = path === href;
    return (
      <Link
        href={href}
        className={`nav-link px-3 fw-semibold ${
          active ? "text-primary" : "text-dark"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="navbar navbar-expand bg-white shadow-sm">
      <div className="container">
        <span className="navbar-brand fw-bold">Health AI</span>

        <div className="navbar-nav ms-auto">
          {navItem("/", "Obesity Predict")}
          {navItem("/drawing", "Drawing Test")}
        </div>
      </div>
    </nav>
  );
}