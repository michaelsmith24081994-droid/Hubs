# Monzo Spending

A personal iOS (SwiftUI) app that connects to your Monzo account via the Monzo
OAuth API to track spending and savings.

This first milestone covers:

1. **Xcode project scaffold** — SwiftUI app, iOS 17+.
2. **OAuth login** — authorization-code flow (confidential client) via
   `ASWebAuthenticationSession`, with token storage in the **Keychain**.
3. **Transactions screen** — pulls your account, balance, and recent
   transactions and displays them with a simple month-spend summary.

## Project layout

```
MonzoSpending/
├─ MonzoSpending.xcodeproj
└─ MonzoSpending/
   ├─ MonzoSpendingApp.swift        App entry point
   ├─ Config/
   │  └─ OAuthConfig.swift          Client ID / secret / endpoints
   ├─ Auth/
   │  ├─ AuthManager.swift          OAuth flow + token refresh
   │  └─ KeychainStore.swift        Keychain wrapper
   ├─ Networking/
   │  ├─ MonzoModels.swift          Codable API models
   │  └─ MonzoAPIClient.swift       REST client
   └─ Views/
      ├─ RootView.swift             Auth-state router
      ├─ LoginView.swift            "Connect Monzo" screen
      └─ TransactionsView.swift     Balance + transactions list
```

> The Xcode project uses file-system-synchronized groups (Xcode 16+), so new
> files added under `MonzoSpending/` are picked up automatically.

## Setup

### 1. Create a Monzo OAuth client

1. Sign in at <https://developers.monzo.com> with your Monzo account.
2. Create a new OAuth client:
   - **Redirect URL:** `monzospending://oauth/callback`
   - **Confidentiality:** **Confidential**
3. Note the **Client ID** and **Client secret**.

### 2. Add your credentials

Open `MonzoSpending/Config/OAuthConfig.swift` and fill in:

```swift
static let clientID = "oauth2client_..."
static let clientSecret = "mnzconf..."
```

If you change the redirect URL, update `redirectURI` to match (the scheme part
is used as the `ASWebAuthenticationSession` callback scheme).

> **Do not commit real credentials.** `.gitignore` ignores `Secrets.swift` /
> `Secrets.xcconfig` if you prefer to split them out, and you should treat any
> branch with real keys as private.

### 3. Run

Open `MonzoSpending.xcodeproj` in Xcode 16+, set your signing team, and run on a
device or simulator. Tap **Connect Monzo**, approve in the browser, then approve
the access request in your Monzo app.

## Security note — confidential client on mobile

A *confidential* OAuth client requires the **client secret** during the token
exchange. On a mobile app that secret is embedded in the binary and can be
extracted, so this design is only suitable for a **personal app that you alone
install**.

The fully secure pattern is to keep the secret on a small backend you control
and have the app exchange the authorization code through that backend. The token
exchange in `AuthManager.postTokenRequest(_:)` is the single place that would
call your backend instead of Monzo directly. This was built client-side per the
project's stated requirements.

## Monzo API caveats

- **Strong Customer Authentication (SCA):** after signing in you must approve
  access in the Monzo app. Until then, and again after 5 minutes, transaction
  access is limited.
- **90-day history:** without ongoing SCA approval, the API only returns the
  last 90 days of transactions. The app requests the last 89 days.
- **Personal use only:** Monzo's API terms restrict these clients to your own
  account.

## Roadmap

- Savings pots and per-category breakdowns.
- Pagination / infinite scroll for older transactions.
- Charts for spending trends.
- Optional token-exchange backend to remove the embedded secret.
