import Foundation

/// Configuration for the Monzo OAuth flow.
///
/// ⚠️ SECURITY NOTE
/// This is a *confidential* client, which means the client secret is sent during
/// the token exchange. On a mobile app the secret is embedded in the binary and
/// can be extracted, so this is only appropriate for a personal app that you alone
/// install. The fully secure design moves the token exchange to a small backend you
/// control. See the README for details.
///
/// Fill in `clientID` and `clientSecret` with the values from your app in the
/// Monzo developer portal (https://developers.monzo.com). Do NOT commit real
/// credentials — keep them local.
enum OAuthConfig {
    /// Your Monzo OAuth client ID (e.g. "oauth2client_00009...").
    static let clientID = ""

    /// Your Monzo OAuth client secret (confidential client).
    static let clientSecret = ""

    /// Redirect URI registered in the Monzo developer portal.
    /// The scheme portion is used as the `ASWebAuthenticationSession` callback scheme.
    static let redirectURI = "monzospending://oauth/callback"

    static let authorizationEndpoint = URL(string: "https://auth.monzo.com/")!
    static let tokenEndpoint = URL(string: "https://api.monzo.com/oauth2/token")!
    static let apiBaseURL = URL(string: "https://api.monzo.com")!

    /// The custom-scheme part of `redirectURI`, e.g. "monzospending".
    static var callbackScheme: String {
        URL(string: redirectURI)?.scheme ?? "monzospending"
    }

    /// Whether the client credentials have been supplied.
    static var isConfigured: Bool {
        !clientID.isEmpty && !clientSecret.isEmpty
    }
}
