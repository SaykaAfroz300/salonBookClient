import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="rounded-3xl border border-[#e8dfd6] bg-white p-10 shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <XCircle className="h-8 w-8" />
        </span>
        <h1 className="font-display mt-5 text-4xl font-semibold text-[#1f1a17]">
          Payment Cancelled
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6e655f]">
          No charges were made. Your confirmed appointment remains unpaid—you
          can complete payment anytime from your Customer Dashboard.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/customer/appointments"
            className="inline-flex items-center gap-2 rounded-full bg-[#1f1a17] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b5654d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to My Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}
