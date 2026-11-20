"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";
import { ServiceCard } from "@/components/ServiceCard";
import { PageLoader, ServiceGridSkeleton } from "@/components/Loader";

function BrowseServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category && category !== "All") params.set("category", category);
      if (sort && sort !== "newest") params.set("sort", sort);

      const res = await apiFetch<{ success: boolean; data: SalonService[] }>(
        `/api/services?${params.toString()}`
      );
      setServices(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load salon services.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    router.replace("/services");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#b5654d]">
          Salon Menu
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-[#1f1a17] sm:text-5xl">
          Browse Salon Services
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6e655f]">
          Discover our full menu of active hair, skincare, nail, makeup, and spa
          treatments. Filter by category, search by service name, or sort by
          price.
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="mt-8 rounded-2xl border border-[#e8dfd6] bg-white p-4 shadow-xs">
        <div className="grid gap-3 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services by name..."
              className="w-full rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-4 text-sm text-[#1f1a17] placeholder:text-[#6e655f] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative md:col-span-4">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full appearance-none rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-8 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Sort */}
          <div className="relative md:col-span-3">
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e655f]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort services"
              className="w-full appearance-none rounded-xl border border-[#e8dfd6] bg-[#faf7f2] py-2.5 pl-10 pr-8 text-sm text-[#1f1a17] focus:border-[#b5654d] focus:bg-white focus:outline-none"
            >
              <option value="newest">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {(search || category !== "All" || sort !== "newest") && (
          <div className="mt-3 flex items-center justify-between border-t border-[#f4eae3] pt-3 text-xs text-[#6e655f]">
            <span>
              Showing {services.length}{" "}
              {services.length === 1 ? "service" : "services"}
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 font-semibold text-[#b5654d] hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="mt-8">
        {loading ? (
          <ServiceGridSkeleton count={6} />
        ) : services.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e8dfd6] bg-white p-14 text-center">
            <h3 className="font-display text-2xl font-semibold text-[#1f1a17]">
              No matching services found
            </h3>
            <p className="mt-2 text-sm text-[#6e655f]">
              Try adjusting your search keywords or selecting another category.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#b5654d]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading salon services..." />}>
      <BrowseServicesContent />
    </Suspense>
  );
}
