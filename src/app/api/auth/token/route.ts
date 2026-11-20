import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { SignJWT } from "jose";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "JWT_SECRET is not configured" },
        { status: 500 }
      );
    }

    const user = session.user as typeof session.user & {
      role?: string;
      isBlocked?: boolean;
      phone?: string;
    };

    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "admin" ? "admin" : "customer",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(new TextEncoder().encode(secret));

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image || "",
        role: user.role === "admin" ? "admin" : "customer",
        isBlocked: Boolean(user.isBlocked),
        phone: user.phone || "",
      },
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to issue authentication token" },
      { status: 500 }
    );
  }
}
