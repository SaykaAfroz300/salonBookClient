import Link from "next/link";
import { ArrowLeft, Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf7f2] px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4eae3] text-[#b5654d]">
        <Scissors className="h-6 w-6" />
      </span>
      <h1 className="font-display mt-6 text-5xl font-semibold text-[#1f1a17]">
        404 — Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-[#6e655f]">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1f1a17] px-6 py-3 text-sm font-medium text-[#faf7f2] transition hover:bg-[#b5654d]"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Home
      </Link>
    </div>
  );
}
