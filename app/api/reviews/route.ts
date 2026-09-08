import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  let body: { restaurantId?: number; rating?: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Your request was not valid JSON." },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = body;

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return Response.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  if (typeof comment !== "string" || comment.trim().length === 0) {
    return Response.json(
      { error: "Comment must not be empty." },
      { status: 400 }
    );
  }

  const restaurants = await sql`
    SELECT id FROM restaurants WHERE id = ${restaurantId}
  `;
  if (restaurants.length === 0) {
    return Response.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }

  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return Response.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}