---
draft: false
title: "SMS Is a Lossy Channel: An Architect's Guide to OTPs, Alerts, and Graceful Degradation"
date: "2026-05-19T18:00:00+05:45"
category: ["technical-notes"]
categories:
  - technical-notes
directory: technical-notes
excerpt: "SMS looks like a reliable transport because it usually works. Architecturally, it's a best-effort store-and-forward network with no end-to-end SLA. Here's what every engineer should design for before wiring OTPs, alerts, or 2FA to a text message."
cover: "/images/blog/technical-notes/sms-is-a-lossy-channel/cover.png"
thumb: "/images/blog/technical-notes/sms-is-a-lossy-channel/thumb.png"
use_featured_image: true
last_modified_at: "2026-05-19T18:00:00+05:45"
tags:
  - architecture
  - sms
  - otp
  - authentication
  - reliability
  - distributed-systems
---

Most teams treat SMS the way they treated email circa 2005 — a transport that "just works" until the day a customer cannot log in because a verification code arrived four minutes late. By that point the user has typed the old code, requested a new one, received two more out of order, and filed a support ticket the on-call engineer will spend an hour failing to reproduce.

SMS is not a reliable channel. It is a best-effort, store-and-forward, multi-hop network with no end-to-end delivery guarantee, no consistent latency, and asymmetric visibility — the provider can confirm the message left their system, but rarely whether it actually rang a phone. Authentication, payment confirmations, incident alerts, and any other use case where a 30-second tail latency is a user-facing failure must be designed for the channel's failure modes from day one, not retrofitted with retries after the first outage.

What follows is an architect-level briefing on the failure modes of SMS as a transport, and the design choices that contain them.

## Why SMS is unreliable: the path a message actually takes

When an application sends an OTP via a provider such as Twilio, MessageBird, or Sinch, the message traverses at least four independent systems before reaching a handset:

```text
Application
   ↓ HTTPS
SMS provider (Twilio / MessageBird / Sinch)
   ↓ SMPP / proprietary
SMS aggregator / carrier gateway
   ↓ SS7 / SIP
Destination carrier's SMSC (Short Message Service Center)
   ↓ over-the-air
Recipient handset
```

Each hop has its own queue, its own retry policy, and its own definition of "delivered." The carrier's SMSC is the most consequential link: it implements **store-and-forward**, meaning when the destination handset is unreachable — no signal, roaming, powered off, on a Wi-Fi-only flight — the SMSC holds the message and retries on its own schedule. That schedule is not configurable from upstream. It can be seconds. It can be hours. In some carriers, after 24–72 hours, the message is silently dropped.

The architectural consequence: **delivery time is unbounded, and a "delivered" status from the provider does not mean the message was received by the user.**

## The failure modes you need a strategy for

### 1. Tail latency is the rule, not the exception

For domestic, well-routed traffic, the median SMS delivery is sub-3 seconds. The p99 is closer to 30 seconds. The p99.9 is in minutes — and that long tail is where support tickets accumulate. A 60-second OTP TTL means roughly 1 in 1,000 codes arrives after expiry even on a good route. At scale, that translates to hundreds of failed logins per day on an otherwise healthy system.

### 2. Carrier-side A2P filtering

Carriers globally have moved aggressively to filter Application-to-Person (A2P) traffic. The U.S. has 10DLC and TCR registration. India has DLT. The UK, Australia, Singapore, Indonesia, and Saudi Arabia all require pre-registered sender IDs or templates. Unregistered traffic — or registered traffic that drifts from its approved template — is silently dropped. **The provider dashboard will still report it as delivered.** There is no error to log.

### 3. Grey routes and international hops

International SMS, especially through low-cost providers, is often routed via "grey routes" — paths that bounce through third-country aggregators to avoid termination fees. Latency is unpredictable, delivery rates can sit at 70–80% in steady state, and routes can change without notice when an upstream contract expires. For any product with international users, route quality per country should be confirmed directly with the provider; the default assumption otherwise should be the worst route.

### 4. Number portability lag

When a user ports their number to a new carrier, the global Number Portability databases can take hours to propagate. During that window, the message may route to the old carrier and never arrive. No signal of this condition is surfaced upstream.

### 5. Silent drops

The most insidious failure: the carrier accepts the message, returns a "delivered" DLR (Delivery Receipt), and never rings the phone. Spam filtering, handset-side blocking, and recently-marked-as-spam sender pools all produce a clean "delivered" status with no message on the handset. The observability layer is, in effect, lying.

### 6. Race conditions from user retries

Because the user cannot see why a code has not arrived, they press "resend" — often three or four times. If the backend issues a new code per request and invalidates the previous one (the default in most OTP libraries), codes arrive out of order under varying carrier latency. The user enters the *first* one to arrive, receives "invalid code," and is locked out.

## What to design for

The core principle is straightforward: **SMS is a delivery mechanism, not a contract.** The surrounding system must be architected for resilience to its failure modes, not dependence on its success.

### Treat the OTP TTL as a delivery budget, not a security parameter

A common instinct is to set OTP validity to 60 seconds for "security." In practice, the entropy of a 6-digit code (1 in 1,000,000) combined with rate limiting (5 attempts max) provides sufficient protection at a 10-minute window. Widening the TTL to 5–10 minutes carries a negligible marginal security cost while bringing the entire tail of the latency distribution inside the validity window.

### Allow multiple in-flight codes, validate any of them

When a user requests a resend, the previous code should remain valid. Maintain a small set — typically the last three — of active codes per session, each valid until its own TTL expires, and validate against the set. This single change eliminates the largest class of OTP support tickets (codes arriving out of order) without weakening security.

### Always offer a non-SMS fallback

After 30 seconds without successful verification, surface a "didn't get the code?" affordance. Options, in increasing order of robustness:

1. **Voice call OTP** — same provider, completely different delivery path. Bypasses A2P filtering entirely. Adds roughly $0.02 per call but rescues the worst tail-latency users.
2. **Email OTP** — slower, but reaches users behind enterprise firewalls and on flights.
3. **TOTP / authenticator app** — for repeat users, prompt enrollment in an authenticator app after the first successful SMS login. TOTP has no delivery network at all.
4. **WhatsApp / RCS Business** — increasingly viable in markets with high WhatsApp penetration; uses data, not the carrier voice channel.

### Use Verify APIs, not raw SMS APIs

Twilio Verify, MessageBird Verify, Sinch Verify, and Vonage Verify abstract the channel — selecting SMS, voice, WhatsApp, or silent network auth based on the destination country, carrier health, and live deliverability signals, with automatic cross-channel retries. **Raw SMS sending and in-house code validation are not worth maintaining.** Carrier rule changes across a dozen jurisdictions move faster than any internal team can track.

### Monitor delivery, not "delivered"

The provider DLR is a starting point, not the truth. The metric that matters is **OTP completion rate** — the fraction of OTP requests where a user successfully entered a valid code within the TTL. Slice it by country, carrier (where detectable), and channel. A drop in completion rate per country is the earliest signal of route degradation, often hours before the provider reports anything. This metric belongs on a dashboard with an alert attached.

### Rate-limit on the recipient, not just the sender

An unprotected OTP endpoint becomes a free SMS-pumping fountain to a premium-rate number controlled by an attacker — capable of costing tens of thousands of dollars overnight. Rate-limit per destination number, not just per user or IP. Cap velocity per country. Block destination countries outside the served region. Place CAPTCHA on the request endpoint, not just the verification endpoint.

### Register everything, everywhere you operate

U.S. traffic requires a 10DLC campaign registered with TCR. India requires DLT templates. The UK requires a registered alphanumeric sender ID. Each jurisdiction is a one-time process that takes one to four weeks. Treat registration as part of launching in a country, not as a problem to address once delivery rates dip. Providers offer assistance, but only on request.

### Build for the day your SMS provider has an outage

Twilio, AWS SNS, and Sinch all experience multi-hour outages roughly once a year. A sign-in flow with a hard dependency on one provider is a single point of failure on the front door. A secondary provider wired behind a feature flag with a 60-second cutover rarely needs to be used — but pays for itself the first time it is.

## Does AWS make this more reliable?

A common assumption is that routing SMS through AWS — SNS, End User Messaging SMS, Pinpoint, or Cognito's built-in SMS MFA — sidesteps the failure modes above. It does not. Every one of those services terminates into the same carrier networks, the same SMSCs, the same A2P filters, and the same store-and-forward queues described earlier. The AWS brand does not buy a different SMS network.

What AWS actually provides:

- **SNS** — a cheap, IAM-integrated raw-send API. Comparable to sending raw SMS through any aggregator. No Verify-equivalent. No built-in cross-channel fallback. DLR fidelity varies by region.
- **End User Messaging SMS (formerly Pinpoint SMS)** — adds origination-number pools, opt-out lists, basic deliverability reporting, and per-country configuration. Useful, but not a deliverability product on par with Twilio Verify or Sinch Verify.
- **Cognito SMS MFA** — uses SNS underneath. It should be treated as raw SMS, not as a managed verification product. The same OTP-TTL, retry, and rate-limit concerns apply.
- **Pinpoint (the analytics product)** — campaign orchestration across SMS, push, and email. Useful for marketing flows; not a substitute for a Verify API on the auth path.

Where AWS legitimately helps: cost at volume, VPC and IAM integration, and tight coupling with the rest of an AWS-native stack. Where it does not help: tail latency, silent drops, carrier-side filtering, number-portability lag, or any of the other failure modes that live below the provider layer.

The reliable pattern is not "choose AWS" or "choose Twilio." It is the architecture described in the rest of this post — wrapped around whichever provider is cost- and integration-appropriate. For many teams the right choice is **SNS or End User Messaging as the cost-efficient primary, with a Verify-style provider (Twilio, Sinch, MessageBird) as the secondary behind the feature-flagged failover**. AWS becomes reliable for SMS only when treated as one provider among several, not as a guarantee.

## A reference architecture

For most teams, a sensible SMS-backed verification flow looks like this:

```text
User requests code
     ↓
[Rate limiter: per-user, per-IP, per-destination, per-country]
     ↓
[OTP service]
   • Generate code, store with 5-min TTL
   • Keep last 3 active codes per session
     ↓
[Channel selector]
   • Country/carrier policy: SMS, voice, WhatsApp, email
   • Provider failover behind feature flag
     ↓
[Verify API call]
     ↓
[Observability]
   • Provider DLR (lower bound)
   • App-level completion rate (truth)
   • Per-country, per-channel dashboards
   • Alert on completion-rate drop, not on send-failure
     ↓
After 30s: "Didn't get the code? Try voice / email"
After 60s: surface alternative auth (passkey, magic link)
```

None of these components are exotic. Together, they are the difference between an auth system that works for 99% of users and one that works for 99.95%.

## The deeper architectural lesson

SMS is the first transport most engineers wire up without treating it as a distributed system. It presents as a function call — "send this string to this number" — but underneath is a multi-hop, multi-vendor, partially-observable, store-and-forward network with no contractual SLA and operator-specific filtering rules that change weekly.

Every transport that crosses an administrative boundary outside one's control behaves this way: email, push notifications, webhook deliveries to third-party endpoints. The discipline required to design around SMS — bounded retries with idempotency, multi-channel fallback, recipient-side rate limiting, completion-based metrics, provider redundancy — is the same discipline that makes any cross-boundary integration robust.

Treat the channel as lossy. Design the system to be honest about it. End users should never notice — which is the entire point.

## References

- [Twilio: SMS Delivery Best Practices](https://www.twilio.com/docs/messaging/guides/best-practices-getting-started)
- [Twilio Verify documentation](https://www.twilio.com/docs/verify)
- [The Campaign Registry (TCR) — 10DLC in the US](https://www.thecampaignregistry.com/)
- [TRAI DLT registration — India](https://trai.gov.in/)
- [OWASP: Authentication Cheat Sheet — Multi-Factor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST SP 800-63B — Digital Identity Guidelines (SMS deprecation context)](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [GSMA: A2P SMS Messaging Guidelines](https://www.gsma.com/)
- [AWS End User Messaging SMS — Best practices](https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-best-practices.html)
- [Amazon SNS — SMS sending limits and deliverability](https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-phone-number-as-subscriber.html)
