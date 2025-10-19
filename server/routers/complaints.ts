import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { complaints, whatsappConfig } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Function to send WhatsApp notification
async function sendWhatsAppNotification(complaint: any) {
  try {
    const db = await getDb();
    if (!db) return;

    const config = await db.select().from(whatsappConfig).limit(1);
    
    if (!config.length || !config[0].isEnabled || !config[0].apiKey || !config[0].phoneNumber) {
      console.log("WhatsApp notifications not configured or disabled");
      return;
    }

    const { apiKey, apiUrl, phoneNumber } = config[0];
    const message = `🔔 شكوى جديدة

📝 الموضوع: ${complaint.subject}
👤 الاسم: ${complaint.name}
📧 البريد: ${complaint.email || 'غير محدد'}
📱 الهاتف: ${complaint.phone || 'غير محدد'}
💬 الرسالة: ${complaint.message}

⏰ التاريخ: ${new Date().toLocaleString('ar-EG')}`;

    const response = await fetch(apiUrl || 'https://wasenderapi.com/api/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message
      })
    });

    if (!response.ok) {
      console.error("Failed to send WhatsApp notification:", await response.text());
    }
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
  }
}

export const complaintsRouter = router({
  // Public endpoint to submit complaints
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(1, "الاسم مطلوب"),
      email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
      phone: z.string().optional(),
      subject: z.string().min(1, "الموضوع مطلوب"),
      message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
      attachmentUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [complaint] = await db.insert(complaints).values({
        ...input,
        email: input.email || null,
        status: "pending",
        priority: "medium",
      }).$returningId();

      // Get the full complaint data
      const [newComplaint] = await db.select().from(complaints).where(eq(complaints.id, complaint.id));

      // Send WhatsApp notification
      await sendWhatsAppNotification(newComplaint);

      return { success: true, id: complaint.id };
    }),

  // Admin endpoints
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "in_progress", "resolved", "closed"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const filters = input?.status ? eq(complaints.status, input.status) : undefined;
      
      const results = await db
        .select()
        .from(complaints)
        .where(filters)
        .orderBy(desc(complaints.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      return results;
    }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [complaint] = await db.select().from(complaints).where(eq(complaints.id, input));
      return complaint;
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_progress", "resolved", "closed"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(complaints)
        .set({
          status: input.status,
          notes: input.notes,
          assignedTo: ctx.user?.id,
        })
        .where(eq(complaints.id, input.id));

      return { success: true };
    }),

  updatePriority: protectedProcedure
    .input(z.object({
      id: z.number(),
      priority: z.enum(["low", "medium", "high", "urgent"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(complaints)
        .set({ priority: input.priority })
        .where(eq(complaints.id, input.id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(complaints).where(eq(complaints.id, input));
      return { success: true };
    }),

  stats: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      };

      const allComplaints = await db.select().from(complaints);
      
      return {
        total: allComplaints.length,
        pending: allComplaints.filter((c: any) => c.status === "pending").length,
        inProgress: allComplaints.filter((c: any) => c.status === "in_progress").length,
        resolved: allComplaints.filter((c: any) => c.status === "resolved").length,
        closed: allComplaints.filter((c: any) => c.status === "closed").length,
      };
    }),
});

