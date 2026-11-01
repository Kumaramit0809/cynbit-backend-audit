// R2: app/contact/actions.ts, validated and rate-limited Server Action
'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 m'),
});
const resend = new Resend(process.env.RESEND_API_KEY);

const ContactSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  company: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot field, hidden in the UI
});

// Server Actions answer HTTP 200 even on failure, so return a typed result
export type ContactState =
  | { ok: true; id: string }
  | {
      ok: false;
      error: 'rate_limited' | 'validation' | 'server';
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function submitContact(
  _prev: ContactState | null,
  formData: FormData,
): Promise<ContactState> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const { success } = await ratelimit.limit(`contact:${ip}`);
  if (!success) return { ok: false, error: 'rate_limited' };

  const parsed = ContactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { ok: false, error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors };

  const { website, ...data } = parsed.data;
  if (website) return { ok: true, id: 'ignored' }; // bot: pretend success

  try {
    const inquiry = await prisma.inquiry.create({ data });

    // Plain-text body; user input never goes into email headers
    await resend.emails.send({
      from: 'Cynbit <noreply@cynbit.in>',
      to: ['opportunities@cynbit.in'],
      subject: `New inquiry #${inquiry.id}`,
      text: `${data.fullName} <${data.email}>\n\n${data.message}`,
    });

    return { ok: true, id: inquiry.id };
  } catch {
    console.error('contact_failed', { requestId: h.get('x-vercel-id') }); // alert on this
    return { ok: false, error: 'server' };
  }
}
