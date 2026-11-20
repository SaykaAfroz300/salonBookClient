"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { CATEGORY_DETAILS, SERVICE_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceGridSkeleton } from "@/components/Loader";

interface CategoryCount {
  name: string;
  count: number;
}

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>(
    SERVICE_CATEGORIES.map((name) => ({ name, count: 0 }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadHomeData() {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          apiFetch<{ success: boolean; data: SalonService[] }>(
            "/api/services?limit=6"
          ),
          apiFetch<{ success: boolean; data: CategoryCount[] }>(
            "/api/services/categories"
          ),
        ]);
        if (!active) return;
        setFeaturedServices(servicesRes.data || []);
        if (categoriesRes.data?.length) {
          setCategories(categoriesRes.data);
        }
      } catch {
        // Gracefully handle empty/offline API during initial setup
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-[#1f1a17]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f1a17] via-[#1f1a17]/85 to-[#1f1a17]/40" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#f4eae3] backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#d99b82]" />
              Modern Salon &amp; Spa Booking
            </span>
            <h1 className="font-display mt-6 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
              Elevate Your Ritual, Book with Effortless Grace.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#faf7f2]/80 sm:text-lg">
              Explore curated haircuts, dimensional color, botanical facials,
              and restorative spa treatments. Request your preferred time slot
              online and pay seamlessly once confirmed.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-[#b5654d] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#964e39]"
              >
                Explore Salon Services
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section 1: Featured Salon Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#b5654d]">
              Curated Treatments
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#1f1a17]">
              Featured Salon Services
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#b5654d] transition hover:text-[#964e39]"
          >
            View All Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          {loading ? (
            <ServiceGridSkeleton count={6} />
          ) : featuredServices.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e8dfd6] bg-white p-12 text-center">
              <p className="text-sm text-[#6e655f]">
                No active salon services are published yet. Check back soon or
                seed services from the server.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Section 2: Salon Service Categories */}
      <section className="border-y border-[#e8dfd6] bg-[#f4eae3]/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#b5654d]">
              Browse by Specialty
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold text-[#1f1a17]">
              Salon Service Categories
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#6e655f]">
              Choose a category to discover tailored treatments crafted by our
              experienced stylists, estheticians, and spa therapists.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const meta = CATEGORY_DETAILS[cat.name] || {
                tagline: "Tailored luxury salon care",
                image:
                  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
              };
              return (
                <Link
                  key={cat.name}
                  href={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl bg-[#1f1a17] p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img
                    src={meta.image}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a17]/90 via-[#1f1a17]/35 to-transparent" />
                  <div className="relative">
                    <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                      {cat.count} {cat.count === 1 ? "Service" : "Services"}
                    </span>
                    <h3 className="font-display mt-2 text-2xl font-semibold text-white">
                      {cat.name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-white/80">
                      {meta.tagline}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Extra Custom Section: How SalonBook Works & Why Guests Love Us */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#b5654d]">
            The SalonBook Experience
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold text-[#1f1a17]">
            Seamless Booking from Discovery to Checkout
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e8dfd6] bg-white p-7 shadow-xs">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eae3] text-[#b5654d]">
              <CalendarCheck className="h-6 w-6" />
            </span>
            <h3 className="font-display mt-5 text-2xl font-semibold text-[#1f1a17]">
              1. Pick Service &amp; Slot
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[#6e655f]">
              Browse active treatments, compare prices and durations, and submit
              your preferred date and time slot without double-booking worries.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8dfd6] bg-white p-7 shadow-xs">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eae3] text-[#b5654d]">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="font-display mt-5 text-2xl font-semibold text-[#1f1a17]">
              2. Salon Confirmation
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[#6e655f]">
              Our salon concierge reviews your request promptly and confirms
              your specialist availability directly in your personal dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8dfd6] bg-white p-7 shadow-xs">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4eae3] text-[#b5654d]">
              <CreditCard className="h-6 w-6" />
            </span>
            <h3 className="font-display mt-5 text-2xl font-semibold text-[#1f1a17]">
              3. Secure Stripe Payment
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[#6e655f]">
              Once confirmed, complete your payment securely via Stripe Checkout
              and arrive ready to unwind with zero front-desk hassle.
            </p>
          </div>
        </div>

        {/* Guest Highlight Strip */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl bg-[#1f1a17] px-8 py-10 text-white md:flex-row">
          <div className="max-w-xl">
            <div className="flex items-center gap-1 text-[#d99b82]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                Trusted by 2,500+ Salon Guests
              </span>
            </div>
            <h3 className="font-display mt-3 text-3xl font-semibold">
              Ready for your next signature salon visit?
            </h3>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#b5654d] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#964e39]"
          >
            Book an Appointment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
