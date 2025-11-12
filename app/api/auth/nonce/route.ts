import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { address, chain } = await request.json();

    if (!address || !chain) {
      return NextResponse.json(
        { error: "Address and chain are required" },
        { status: 400 },
      );
    }

    const nonce = randomBytes(32).toString("hex");
    const message = `Sign this message to authenticate with our app. Nonce: ${nonce}`;

    // Salva no Redis por 5 minutos
    const key = `nonce:${chain}:${address.toLowerCase()}`;
    await redis.setex(key, 300, JSON.stringify({ nonce, message }));

    return NextResponse.json({
      message,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
