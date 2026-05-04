# HardHeartHeard — Android App

A native Kotlin + Jetpack Compose Android client for [hardheartheard.vercel.app](https://hardheartheard.vercel.app).

---

## Setup before building

### 1. Supabase credentials

Open `app/src/main/java/com/hardheartheard/app/data/auth/AuthManager.kt` and replace:

```/dev/null/placeholder.kt#L1-3
private const val SUPABASE_URL      = "YOUR_SUPABASE_URL"
private const val SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"
const val GOOGLE_WEB_CLIENT_ID      = "YOUR_GOOGLE_WEB_CLIENT_ID"
```

- **SUPABASE_URL** — your Supabase project URL, e.g. `https://abcdefgh.supabase.co`
- **SUPABASE_ANON_KEY** — your Supabase project's `anon` / public API key
- **GOOGLE_WEB_CLIENT_ID** — the **Web** OAuth 2.0 Client ID from [Google Cloud Console](https://console.cloud.google.com/). This is NOT the Android client ID. You need the web client ID because Supabase's ID-token flow requires it.

### 2. Google Sign-In setup

1. In [Google Cloud Console](https://console.cloud.google.com/), navigate to **APIs & Services → Credentials**
2. Ensure you have an **OAuth 2.0 Client ID** of type **Web application** — copy that as `GOOGLE_WEB_CLIENT_ID`
3. Also create an **Android** OAuth client ID (package `com.hardheartheard.app`) and add your debug SHA-1 fingerprint. Run: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
4. In Supabase dashboard → **Auth → Providers → Google**, enable Google and add the Web Client ID + Secret

### 3. Next.js API — Bearer token patch (required for writes)

The Next.js API routes at `/api/posts` and `/api/comments` currently authenticate via **Supabase cookie sessions** (browser-only). The Android app sends `Authorization: Bearer <token>` instead.

To make this work, patch each API route to also accept the Bearer token:

```/dev/null/api-patch.ts#L1-12
// At the top of /api/posts/route.ts (and /api/comments/route.ts):
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Replace getUser() call with:
const authHeader = req.headers.get('authorization')
const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
const { data: { user } } = token
  ? await supabaseAdmin.auth.getUser(token)
  : await supabase.auth.getUser()  // falls back to cookie session
```

---

## Project structure

```
android/
  app/src/main/java/com/hardheartheard/app/
    MainActivity.kt              — App entry point
    data/
      api/
        ApiService.kt            — Retrofit interface for Next.js API
        Models.kt                — Data classes (Post, Comment, Profile, …)
      auth/
        AuthManager.kt           — Supabase client + Google Sign-In via CredentialManager
    navigation/
      NavGraph.kt                — Compose Navigation host + all routes
    ui/
      theme/
        Theme.kt                 — Dark theme, green palette, monospace typography
      components/
        CoinBalance.kt           — ¢ balance display component
        PostCard.kt              — Feed item card
      screens/
        LoginScreen.kt           — Google sign-in screen
        FeedScreen.kt            — Post list with sort + pull-to-refresh
        PostDetailScreen.kt      — Full post + comments + comment input
        WriteScreen.kt           — New post form with live cost meter
        ProfileScreen.kt         — User stats + sign-out
    viewmodel/
      FeedViewModel.kt
      PostDetailViewModel.kt
      WriteViewModel.kt
      ProfileViewModel.kt
```

---

## Building

```/dev/null/commands.sh#L1-5
# From the android/ directory:
./gradlew assembleDebug

# Install on connected device:
./gradlew installDebug
```

Requires Android Studio Hedgehog (2023.1.1) or later, or a standalone JDK 17+ with the Android SDK.

---

## Architecture

- **Auth**: Supabase Kotlin SDK + Android Credential Manager → Google ID token → Supabase session
- **Reads**: Retrofit → Next.js `/api/posts` + `/api/comments` (Bearer token)
- **Profile reads**: Supabase PostgREST SDK direct query to `profiles` table
- **Writes**: Retrofit → Next.js `/api/posts` + `/api/comments` (includes coin deduction logic)
- **State**: `StateFlow` + `ViewModel` per screen, collected via `collectAsState()` in Compose
- **Navigation**: Jetpack Compose Navigation, ViewModels shared at nav-graph scope

---

## Theme

| Token       | Hex       | Usage                         |
|-------------|-----------|-------------------------------|
| Background  | `#000000` | Screen backgrounds            |
| Surface     | `#0A0A0A` | Cards, top bars               |
| Primary     | `#00FF41` | Text, borders, icons          |
| Secondary   | `#00F5FF` | Usernames, accents            |
| Accent      | `#FF006E` | Errors, sign-out              |
| Yellow      | `#FFE600` | Coin balance, cost display    |
| Muted       | `#003B0F` | Selected state backgrounds    |
| Font        | Monospace | All text                      |
