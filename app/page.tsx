import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-[560px] px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">
        Zomato Lite
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Reviews for one restaurant.
      </p>
      <Link
        href="/restaurant/1"
        className="mt-8 inline-flex rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white"
      >
        See Ludhiana Burrito
      </Link>
    </main>
  );
}