# ResellerPro Email System Architecture

## 1. High-Level Architecture

The email system is designed to be **modular**, **reliable**, and **provider-agnostic**. It decouples the *intent* to send an email from the *mechanism* of sending it.

### Core Components:
1.  **Mail Service (`src/lib/mail`)**: A centralized TypeScript service handling all email logic. It exposes high-level methods (e.g., `sendSubscriptionConfirmation`) and hides the details of SMTP/SES.
2.  **Transporter**: A wrapper around `nodemailer` that manages the connection to the email provider (SMTP initially, SES later).
3.  **Template Engine**: React-based or HTML-string based templates. We will use simple HTML strings with variable substitution for performance and zero-dependency, or React Email if complex layouts are needed. Given "Simple", generic HTML/Tailwind strings are robust.
4.  **PDF Generator**: Server-side generation using `pdf-lib` (lightweight, fast) or `react-pdf` (easier layouting).
5.  **Database & Queue**:
    *   **Immutability**: Log every attempt to `email_logs`.
    *   **Idempotency**: Use `last_reminder_sent_at` timestamps in business tables (`profiles`, `enquiries`, `orders`) to prevent duplicate sends.
6.  **Scheduler**:
    *   Next.js API Routes (e.g., `/api/cron/*`) protected by a `CRON_SECRET`.
    *   Invoked by an external scheduler (Vercel Cron, GitHub Actions, or Supabase `pg_cron` via webhooks).

## 2. Recommended Folder Structure

```
src/
  lib/
    mail/
      index.ts           # Public API (sendEmail, etc.)
      config.ts          # SMTP/Env configuration
      types.ts           # Email types
      templates/         # HTML Templates
        subscription.ts
        auth.ts
        order.ts
      transports/        # Provider adapters
        smtp.ts
        ses.ts (future)
    pdf/
      contract.ts        # Contract PDF generator
  app/
    api/
      cron/
        subscription-check/route.ts
        enquiry-alert/route.ts
        order-update/route.ts
```

## 3. Database Schema Extensions

We need to track state to ensure idempotency and history.

```sql
-- Track OTPs
create table auth_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Email Logs (Audit)
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  template_id text not null,
  status text not null, -- 'sent', 'failed'
  error text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Add tracking columns to existing tables
alter table profiles 
  add column subscription_reminder_7d_sent_at timestamptz,
  add column subscription_reminder_3d_sent_at timestamptz,
  add column subscription_reminder_1d_sent_at timestamptz;

-- Enquiries table (assuming exists, or create new)
-- alter table enquiries add column last_reminder_sent_at timestamptz;
```

## 4. Security & Best Practices

1.  **Environment Variables**:
    *   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
    *   `CRON_SECRET` (to protect API routes)
2.  **Rate Limiting**:
    *   OTP: Max 3 requests per 10 minutes per IP/Email (implemented in API logic).
    *   Reminders: Strict database checks (`where last_sent < now() - interval '12 hours'`).
3.  **Idempotency**:
    *   Always check "Has this been sent?" (DB query) *before* sending.
    *   Update DB *after* success (or use a transaction if possible, though email sending is side-effect). Best effort: Mark as "processing" -> Send -> Mark "sent".

## 5. Migration Strategy (SMTP -> SES)

The `MailService` uses an interface `EmailTransport`.
Current implementation: `NodemailerTransport`.
Future implementation: `SESTransport`.
Switching requires changing 1 line in `src/lib/mail/config.ts` or strictly genericizing via env vars.

---

This system is designed to trigger emails via two paths:
1.  **Event-Driven**: Immediate (e.g., User pays -> `sendSubscriptionConfirmation`).
2.  **Scheduled**: Batch (e.g., Cron hits `/api/cron/subscription-check` -> queries DB -> sends batch).
