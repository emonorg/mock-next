import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Received signup data:", { ...data, password: "[REDACTED]" });

    const { name, email, password } = signUpSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    try {
      // Create user
      const userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        name,
        email,
        password: hashedPassword,
      });

      console.log("User created successfully:", userId);

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      return NextResponse.json(
        { message: "User created successfully. Please verify your email." },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Sign up error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 