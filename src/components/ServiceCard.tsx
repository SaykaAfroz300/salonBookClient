import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { SalonService } from "@/types";
import { formatCurrency } from "@/lib/constants";

export function ServiceCard({ service }: { service: SalonService }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-52 w-full overflow-hidden bg-[#f4eae3]">
        <img
          src={service.image}
          alt={service.serviceName}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#1f1a17] shadow-xs">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold leading-snug text-[#1f1a17]">
            {service.serviceName}
          </h3>
          <span className="shrink-0 text-base font-bold text-[#b5654d]">
            {formatCurrency(service.price)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#6e655f]">
          <Clock className="h-3.5 w-3.5 text-[#b5654d]" />
          <span>{service.duration} mins</span>
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-[#6e655f]">
          {service.description}
        </p>

        <div className="mt-5 pt-3 border-t border-[#f4eae3]">
          <Link
            href={`/services/${service._id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1a17] px-4 py-2.5 text-sm font-medium text-[#faf7f2] transition hover:bg-[#b5654d]"
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
