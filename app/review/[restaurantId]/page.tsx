import { headers } from "next/headers";
import ReviewForm from "./ReviewForm";

async function getRestaurantName(id: string): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  try {
    const res = await fetch(
      `${proto}://${host}/api/restaurants/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.name;
  } catch {
    return null;
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const id = Number(restaurantId);

  if (!Number.isInteger(id)) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-12">
        <p className="text-stone-500">That restaurant does not exist.</p>
      </main>
    );
  }

  const restaurantName = await getRestaurantName(String(id));

  if (restaurantName === null) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-12">
        <p className="text-stone-500">That restaurant does not exist.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-6 py-14">
      <ReviewForm restaurantId={id} restaurantName={restaurantName} />
    </main>
  );
}