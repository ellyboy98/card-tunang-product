# 01 Overview

## Goal

A mobile-first invitation card for a Malay engagement ceremony (majlis pertunangan), opened from a WhatsApp link, plus a password-protected admin panel where the family configures the card and manages the guest list without touching code or a database. Both the card and the admin are available in Bahasa Melayu and English: the admin sets the card's default language and can type an English version of every free-text field; a guest can switch with a BM | EN pill on the card, and the admin can switch the admin UI the same way.

## Who uses it

- **Guests** (~100 pax across ~30 households): open the link on a phone, read the details, tap Waze, confirm attendance.
- **Admin** (the couple or a family member): logs in at `/admin`, adds households, edits card content, uploads music and a background image, watches the headcount.

## Scope

In:
- Cover screen with tap-to-open (this tap unlocks audio autoplay)
- Background music with mute toggle
- Couple, parents, opening text, closing text, optional hashtag
- Date, time, live countdown, add-to-calendar (Google link + .ics)
- Venue with Waze and Google Maps deep links
- Atur cara (schedule) as admin-editable rows
- RSVP by dropdown: guest picks their household, confirms up to allocated pax
- Contacts with WhatsApp and call buttons
- Admin: guest CRUD, hide/show, headcount totals, CSV export
- Admin: every card field, font preset, colour preset, MP3 and image upload
- Admin: live phone preview while editing
- Docker Compose local environment; Vercel deployment

Out (do not build):
- Multi-event / multi-tenant. One deployment per event.
- Guest accounts, per-guest links, magic links.
- Free-text guestbook (ucapan). Can be added later as a third table.
- E-gift / DuitNow QR section. Add later if wanted.
- Email or SMS notifications.
- Image gallery.

## The RSVP model (read this carefully)

RSVP is **confirmation, not registration**. The admin creates one row per household with an allocated `pax`. On the card, a guest picks their household from a dropdown (grouped by family side) and confirms **hadir** or **tidak dapat hadir**. When confirming hadir they may choose a number **from 1 up to the allocated pax, never above it**. There is no field anywhere on the public site to type a name or add a person.

Consequences:
- A forwarded link cannot create a new guest. The worst case is someone confirming another household's slot, which the admin can see and correct.
- The dropdown reveals the guest list to anyone with the link. The owner has accepted this trade-off deliberately. Do not add search-based lookup or PIN verification unless asked.
- The card shows the current status after selection ("Sudah disahkan…") so the real invitee notices if someone else touched their slot.

## Success criteria

- Card loads in under 2 s on a mid-range Android on 4G with music and background configured.
- Admin can go from empty database to a fully configured card with 30 households in under 20 minutes, using only the UI.
- A second person can fork the repo, set four env vars, deploy, and have their own card working, following `docs/07-deployment.md` alone.
