"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({
  restaurantId,
  restaurantName,
}: {
  restaurantId: number;
  restaurantName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    rating !== null && comment.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit || rating === null) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          rating,
          comment: comment.trim(),
        }),
      });

      if (res.status === 400) {
        const body = await res.json();
        setError(body.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Could not reach the server. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">
        Review {restaurantName}
      </h1>

      <div
        className="mt-6 flex gap-1"
        role="radiogroup"
        aria-label="Your rating"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-3xl transition-colors ${
              rating !== null && n <= rating
                ? "text-amber-700"
                : "text-stone-300 hover:text-stone-400"
            }`}
            aria-pressed={rating === n}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was it?"
        rows={5}
        className="mt-6 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm outline-none focus:border-amber-700"
      />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-6 rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Submit
      </button>
    </>
  );
}