import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import jwt from "jsonwebtoken";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // محاولة المصادقة باستخدام JWT من الكوكيز
    const cookies = parseCookieHeader(opts.req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];

    if (token) {
      try {
        const decoded = jwt.verify(token, ENV.cookieSecret) as {
          id: string;
          username: string;
          role: "admin" | "user";
        };
        
        user = {
          id: decoded.id,
          name: decoded.username,
          email: null,
          loginMethod: "local",
          role: decoded.role,
          createdAt: new Date(),
          lastSignedIn: new Date(),
        };
      } catch (jwtError) {
        // إذا فشل JWT، حاول المصادقة باستخدام OAuth
        user = await sdk.authenticateRequest(opts.req);
      }
    } else {
      // إذا لم يكن هناك token، حاول المصادقة باستخدام OAuth
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

