import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const host = request.headers.get("host") || "opspilot.test:3000";
    // Check if we are running in https or http
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const redirectUrl = `${proto}://${host}/sso/switch`;

    // Redirect to the clean GET URL /sso/switch
    const response = NextResponse.redirect(new URL(redirectUrl));

    // Put the token in a temporary HttpOnly cookie valid for only 30 seconds
    response.cookies.set({
        name: "sso_switch_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 30, // 30 seconds
        sameSite: "lax",
    });

    return response;
}
