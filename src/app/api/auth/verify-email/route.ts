import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: (fields) => eq(fields.token, token),
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      );
    }

    // Update user
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, verificationToken.identifier));

    // Delete the used token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 