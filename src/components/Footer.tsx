import React from "react";
import Link from "next/link";
import {
  Clock,
  Instagram,
  Facebook,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Twitter,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#e8dfd6] bg-[#1f1a17] text-[#faf7f2]/90">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Description */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b5654d] text-white">
                <Scissors className="h-4 w-4" />
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight text-white">
                SalonBook
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#faf7f2]/70">
              Your sanctuary for effortless beauty, hair artistry, and spa
              wellness. Discover curated treatments and book appointments online
              in moments.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#b5654d]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#b5654d]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#b5654d]"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f4eae3]">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#faf7f2]/75">
              <li>
                <Link href="/" className="transition hover:text-[#b5654d]">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="transition hover:text-[#b5654d]"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Haircut%20%26%20Styling"
                  className="transition hover:text-[#b5654d]"
                >
                  Haircut &amp; Styling
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Spa%20%26%20Massage"
                  className="transition hover:text-[#b5654d]"
                >
                  Spa &amp; Massage
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="transition hover:text-[#b5654d]"
                >
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f4eae3]">
              Contact Salon
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#faf7f2]/75">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#b5654d]" />
                <span>+1 (555) 234-8910</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#b5654d]" />
                <span>concierge@salonbook.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b5654d]" />
                <span>
                  245 Rosewater Avenue, Suite 12
                  <br />
                  SoHo, New York, NY 10012
                </span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f4eae3]">
              Opening Hours
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#faf7f2]/75">
              <li className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#b5654d]" />
                  Mon – Fri
                </span>
                <span>9:00 AM – 7:00 PM</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#b5654d]" />
                  Saturday
                </span>
                <span>9:00 AM – 6:00 PM</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#b5654d]" />
                  Sunday
                </span>
                <span>10:00 AM – 4:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#faf7f2]/60 sm:flex-row">
          <p>© {new Date().getFullYear()} SalonBook. All rights reserved.</p>
          <p>Crafted for serene, modern salon appointments.</p>
        </div>
      </div>
    </footer>
  );
}
