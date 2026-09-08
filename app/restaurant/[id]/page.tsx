import Link from "next/link";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

function baseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { day: "numeric" });
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} ${month}, ${time}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-700 font-semibold">
      {"★".repeat(rating)}
      <span className="text-stone-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: RestaurantData | "missing" | "error" = "error";
  try {
    const res = await fetch(`${baseUrl()}/api/restaurants/${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      data = await res.json();
    } else {
      data = "missing";
    }
  } catch {
    data = "error";
  }

  if (data === "missing") {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-12">
        <p className="text-stone-500">That restaurant does not exist.</p>
      </main>
    );
  }

  if (data === "error") {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-12">
        <p className="text-stone-500">Could not load this page.</p>
      </main>
    );
  }

  const hasReviews = data.totalReviews > 0;

  return (
    <main className="mx-auto max-w-[560px] px-6 py-14">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {data.name}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {data.cuisine} · {data.area}
        </p>
      </header>

      {hasReviews ? (
        <>
          <section className="mb-10">
            <p className="text-6xl font-semibold tabular-nums">
              {data.averageRating}
            </p>
            <p className="mt-2 text-sm text-stone-500">
              {data.totalReviews}{" "}
              {data.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </section>

          {data.latestReview && (
            <section className="mb-10 rounded-xl border border-amber-700/30 bg-amber-700/5 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Latest review
              </p>
              <div className="mt-2">
                <Stars rating={data.latestReview.rating} />
              </div>
              <p className="mt-3 leading-relaxed">
                {data.latestReview.comment}
              </p>
              <p className="mt-3 text-xs text-stone-400">
                {formatDate(data.latestReview.createdAt)}
              </p>
            </section>
          )}

          {data.reviews.length > 0 && (
            <section className="space-y-6">
              {data.reviews.map((review) => (
                <article key={review.id} className="border-t border-stone-200 pt-5">
                  <Stars rating={review.rating} />
                  <p className="mt-2 leading-relaxed">{review.comment}</p>
                  <p className="mt-2 text-xs text-stone-400">
                    {formatDate(review.createdAt)}
                  </p>
                </article>
              ))}
            </section>
          )}
        </>
      ) : (
        <section className="rounded-xl border border-stone-200 p-8 text-center">
          <p className="text-stone-500">
            No reviews yet. Be the first to write one.
          </p>
        </section>
      )}

      <Link
        href={`/review/${id}`}
        className="mt-10 inline-flex rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white"
      >
        Write a review
      </Link>
    </main>
  );
}