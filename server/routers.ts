import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { validateAdminCredentials } from "./auth";
import jwt from "jsonwebtoken";
import { ENV } from "./_core/env";
import { complaintsRouter } from "./routers/complaints";
import { pagesRouter } from "./routers/pages";
import { settingsRouter } from "./routers/settings";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    login: publicProcedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await validateAdminCredentials(input.username, input.password);
        
        if (!user) {
          throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
        }

        // إنشاء JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          ENV.cookieSecret,
          { expiresIn: "7d" }
        );

        // حفظ الـ token في الـ cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
        });

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        };
      }),

    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return null;
      return {
        id: ctx.user.id,
        name: ctx.user.name || ctx.user.id,
        role: ctx.user.role || "admin",
      };
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  complaints: complaintsRouter,
  pages: pagesRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;

