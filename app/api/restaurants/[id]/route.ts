import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  const restaurants = await sql`
    SELECT name, cuisine, area FROM restaurants WHERE id = ${restaurantId}
  `;
  if (restaurants.length === 0) {
    return Response.json(
      { error: "That restaurant does not exist." },
      { status: 404 }
    );
  }

  const stats = await sql`
    SELECT
      COUNT(*)::int AS "totalReviews",
      ROUND(AVG(rating)::numeric, 1) AS "averageRating"
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;

  const latestRows = await sql<ReviewRow[]>`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;

  const olderRows = await sql<ReviewRow[]>`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
    OFFSET 1
  `;

  const restaurant = restaurants[0];
  const statsRow = stats[0];

  return Response.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating:
      statsRow.averageRating === null
        ? null
        : Number(statsRow.averageRating),
    totalReviews: statsRow.totalReviews,
    latestReview:
      latestRows.length > 0 ? toReview(latestRows[0]) : null,
    reviews: olderRows.map(toReview),
  });
}

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}