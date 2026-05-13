import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AuthUser from "@/models/AuthUser";
import { hashPassword } from "@/lib/password";
import { createAuthToken } from "@/lib/token";

async function parseRequestBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };
  }

  return {};
}

export async function POST(request) {
  try {
    const body = await parseRequestBody(request);
    const name = body?.name?.trim();
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await AuthUser.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = await createAuthToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: "Signup successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { message: "Something went wrong during signup." },
      { status: 500 }
    );
  }
}
