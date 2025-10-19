import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { settings, whatsappConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = router({
  // General settings
  get: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [setting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, input))
        .limit(1);

      return setting;
    }),

  list: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(settings);
    }),

  set: protectedProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if setting exists
      const [existing] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, input.key))
        .limit(1);

      if (existing) {
        await db.update(settings)
          .set({ value: input.value, description: input.description })
          .where(eq(settings.key, input.key));
      } else {
        await db.insert(settings).values(input);
      }

      return { success: true };
    }),

  // WhatsApp configuration
  getWhatsAppConfig: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return null;

      const [config] = await db.select().from(whatsappConfig).limit(1);
      return config || null;
    }),

  setWhatsAppConfig: protectedProcedure
    .input(z.object({
      apiKey: z.string().optional(),
      apiUrl: z.string().url("رابط API غير صحيح").optional(),
      phoneNumber: z.string().optional(),
      isEnabled: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if config exists
      const [existing] = await db.select().from(whatsappConfig).limit(1);

      if (existing) {
        await db.update(whatsappConfig)
          .set(input)
          .where(eq(whatsappConfig.id, existing.id));
      } else {
        await db.insert(whatsappConfig).values(input);
      }

      return { success: true };
    }),
});

