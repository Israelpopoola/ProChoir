# ProChoir

A phone-first site for the choir: upcoming set lists, lyrics, links and rehearsal audio, all in one place instead of buried in WhatsApp.

- **Choir members** don't log in. They open the link and see upcoming services as drawers. They tap one to see the songs, then tap a song for its lyrics, key, notes, audio and links.
- **MDs** sign in at `/md` to add songs, upload audio, and build set lists.
- **ProPresenter / FreeShow:** any song or whole set list can be downloaded as `.txt` files (one slide per paragraph).

Built with Next.js, hosted on Vercel, with data, logins and audio files in Supabase.

---

## Setup (about 20 minutes, one time)

### 1. Make a church email
Create a shared address, such as `choir.yourchurch@gmail.com`. Use it to sign up for **GitHub, Supabase and Vercel**, so the church owns everything and you can add more admins later.

### 2. Supabase (database, logins, audio)
1. Go to [supabase.com](https://supabase.com) and sign up with the church email.
2. Create an **organization** named after your church, on the **Free** plan.
3. Create a **new project**. Pick the region closest to your church and save the database password somewhere safe.
4. Open **SQL Editor → New query**, paste in all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
5. Add your MDs to the editor list. Run this in the SQL Editor with your real emails:
   ```sql
   insert into public.editors (email) values ('md1@example.com'), ('md2@example.com');
   ```
6. Go to **Authentication → Users → Add user → Create new user** for each MD (email + password, tick *Auto confirm*).
7. Go to **Authentication → Sign In / Providers** and turn **off** "Allow new users to sign up". Only the accounts you create can log in.
8. Go to **Project Settings → API** (or the **Connect** button) and copy the **Project URL** and the **anon / publishable key**. You'll need them in the next step.

### 3. Vercel (the website)
1. Go to [vercel.com](https://vercel.com) and sign up with the church GitHub account. The free Hobby plan is fine.
2. **Add New → Project** and import this repository.
3. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
   | `NEXT_PUBLIC_CHOIR_NAME` | e.g. `Grace Choir` |
   | `CHOIR_TIMEZONE` | e.g. `America/New_York`, `Europe/London`, `Africa/Lagos` |

4. Click **Deploy**. You'll get a link like `prochoir.vercel.app`.
5. Back in Supabase, go to **Authentication → URL Configuration** and set **Site URL** to that link. The "email me a sign-in link" option needs this.

### 4. Share it
Post the link in the choir WhatsApp group. On iPhone, open it in Safari and tap **Share → Add to Home Screen**. On Android, open it in Chrome and tap **⋮ → Add to Home screen**. It then opens like an app.

The site is set to stay out of Google results, but anyone with the link can view it.

---

## For MDs

### Writing lyrics
Put a blank line between slides, and label sections in square brackets:

```
[Verse 1]
You are here, moving in our midst
I worship You, I worship You

[Chorus]
Way maker, miracle worker
Promise keeper, light in the darkness
```

The choir sees nicely formatted lyrics, and the export to ProPresenter / FreeShow comes out with one slide per paragraph.

### ProPresenter / FreeShow
- On a song, tap **Export .txt**. On a set list, tap **Export lyrics** to get a zip of numbered `.txt` files in set order.
- **ProPresenter:** File → Import → Files…, pick the `.txt` files, and choose blank lines as the slide break.
- **FreeShow:** Import → Text file(s).
- Try one song first to check the section labels come through the way you like.

### Audio: keeping storage small
The free plan has **1 GB of storage** and **about 5 GB of downloads a month**.
- **Use links when you can.** YouTube, Spotify and Google Drive links use no storage.
- **Upload part tracks and rehearsal recordings as MP3s**, not WAV. A 5-minute MP3 at 128 kbps is about 5 MB, so 1 GB holds roughly 200 tracks.
- Audio only downloads when someone presses play, and the phone keeps a copy, so listening again doesn't count against the limit.
- Delete old rehearsal tracks once a season is over.

When you outgrow this, upgrade the Supabase organization to **Pro ($25/month)**. Nothing in the app needs to change.

---

## Running locally (for developers)

```bash
cp .env.example .env.local   # fill in your Supabase values
npm install
npm run dev                  # http://localhost:3000
```
