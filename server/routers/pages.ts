import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { pages } from "../../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";

export const pagesRouter = router({
  // Public endpoints
  getBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [page] = await db
        .select()
        .from(pages)
        .where(eq(pages.slug, input))
        .limit(1);

      return page && page.isPublished ? page : null;
    }),

  listPublished: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const results = await db
        .select()
        .from(pages)
        .where(eq(pages.isPublished, true))
        .orderBy(asc(pages.menuOrder));

      return results;
    }),

  // Admin endpoints
  list: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const results = await db
        .select()
        .from(pages)
        .orderBy(desc(pages.createdAt));

      return results;
    }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [page] = await db.select().from(pages).where(eq(pages.id, input));
      return page;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "العنوان مطلوب"),
      slug: z.string().min(1, "الرابط مطلوب").regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط"),
      content: z.string().min(1, "المحتوى مطلوب"),
      isPublished: z.boolean().default(false),
      showInMenu: z.boolean().default(true),
      menuOrder: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [page] = await db.insert(pages).values({
        ...input,
        createdBy: ctx.user?.id,
      }).$returningId();

      return { success: true, id: page.id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1, "العنوان مطلوب"),
      slug: z.string().min(1, "الرابط مطلوب").regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط"),
      content: z.string().min(1, "المحتوى مطلوب"),
      isPublished: z.boolean(),
      showInMenu: z.boolean(),
      menuOrder: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;
      await db.update(pages)
        .set(updateData)
        .where(eq(pages.id, id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(pages).where(eq(pages.id, input));
      return { success: true };
    }),
});

