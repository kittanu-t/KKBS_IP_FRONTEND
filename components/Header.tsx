"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();

  const navItem = (href: string, label: string) => {
    const active = path === href;
    return (
      <Link
        href={href}
        className={`nav-link px-3 fw-semibold transition-all ${
          active ? "text-success border-bottom border-2 border-success" : "text-dark opacity-75"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="navbar navbar-expand bg-white shadow-sm sticky-top py-3">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center fw-bold gap-2">
          <Image
            src="/logo_transparent.png"
            alt="NeuralyzeFit Logo"
            width={55}
            height={55}
            className="rounded-3"
          />
          <span style={{ color: "var(--color-2)", letterSpacing: "-0.5px" }}>NeuralyzeFit</span>
        </Link>

        <div className="navbar-nav ms-auto gap-2">
          {navItem("/", "Obesity Predict")}
          {navItem("/drawing", "Drawing Test")}
        </div>
      </div>
    </nav>
  );
}