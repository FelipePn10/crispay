import { NextRequest, NextResponse } from "next/server";
import { verifyEvmSignature } from "@/lib/ethers";
import { verifyTronSignature } from "@/lib/tron";
import { signToken } from "@/lib/jwt";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { address, chain, signature } = await request.json();

    if (!address || !chain || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const key = `nonce:${chain}:${address.toLowerCase()}`;
    const stored = await redis.get(key);

    if (!stored) {
      return NextResponse.json(
        { error: "Nonce expired or not found" },
        { status: 401 },
      );
    }

    const { nonce, message } = JSON.parse(stored);
    await redis.del(key);

    let verified = false;
    let normalizedAddress = address;

    if (chain === "evm") {
      try {
        const recoveredAddress = verifyEvmSignature(message, signature);
        verified = recoveredAddress.toLowerCase() === address.toLowerCase();
        normalizedAddress = recoveredAddress.toLowerCase();
      } catch (error) {
        console.error("EVM signature verification failed:", error);
        verified = false;
      }
    } else if (chain === "tron") {
      verified = await verifyTronSignature(message, signature, address);

      if (verified) {
        console.log(`TRON signature verified for: ${address}`);
      } else {
        console.log(`TRON signature verification failed for: ${address}`);
      }
    }

    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const existingWallet = await prisma.wallet.findUnique({
      where: {
        address_chain: {
          address: normalizedAddress,
          chain,
        },
      },
      include: { user: true },
    });

    let user;

    if (existingWallet) {
      user = existingWallet.user;
    } else {
      user = await prisma.user.create({
        data: {
          wallets: {
            create: {
              address: normalizedAddress,
              chain,
            },
          },
        },
      });
    }

    const token = signToken({
      userId: user.id,
      address: normalizedAddress,
      chain,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        address: normalizedAddress,
        chain,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
