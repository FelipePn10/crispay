import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export const authenticate = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No token provided" };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { error: "Invalid token" };
  }

  // Check if session is valid
  const session = await prisma.session.findFirst({
    where: {
      jwt: token,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    return { error: "Session expired" };
  }

  return { user: session.user };
};
