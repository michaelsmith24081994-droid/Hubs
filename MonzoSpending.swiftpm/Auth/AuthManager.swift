import Foundation
import UIKit
import AuthenticationServices

/// Drives the Monzo OAuth authorization-code flow, persists tokens in the
/// Keychain, and vends valid access tokens (refreshing as needed).
@MainActor
@Observable
final class AuthManager: NSObject {
    enum State {
        case signedOut
        case authenticating
        case signedIn
    }

    enum AuthError: LocalizedError {
        case notConfigured
        case notSignedIn
        case stateMismatch
        case missingCode
        case cannotStartSession
        case tokenRequestFailed(status: Int, body: String?)

        var errorDescription: String? {
            switch self {
            case .notConfigured:
                return "Add your Monzo client ID and secret in OAuthConfig.swift."
            case .notSignedIn:
                return "You're not signed in to Monzo."
            case .stateMismatch:
                return "Sign-in could not be verified (state mismatch). Please try again."
            case .missingCode:
                return "Monzo did not return an authorization code."
            case .cannotStartSession:
                return "Could not start the sign-in session."
            case .tokenRequestFailed(let status, let body):
                return "Token request failed (HTTP \(status)).\(body.map { " \($0)" } ?? "")"
            }
        }
    }

    private(set) var state: State = .signedOut
    var errorMessage: String?

    private let keychain = KeychainStore(service: "com.example.MonzoSpending.tokens")
    private let tokenAccount = "monzo"
    private var token: StoredToken?
    private var webAuthSession: ASWebAuthenticationSession?

    override init() {
        super.init()
        restoreSession()
    }

    // MARK: - Session lifecycle

    private func restoreSession() {
        guard
            let data = keychain.read(account: tokenAccount),
            let stored = try? JSONDecoder().decode(StoredToken.self, from: data)
        else { return }
        token = stored
        state = .signedIn
    }

    func signOut() {
        keychain.delete(account: tokenAccount)
        token = nil
        errorMessage = nil
        state = .signedOut
    }

    // MARK: - Sign in

    func signIn() async {
        guard OAuthConfig.isConfigured else {
            errorMessage = AuthError.notConfigured.errorDescription
            return
        }

        state = .authenticating
        errorMessage = nil

        do {
            let expectedState = UUID().uuidString
            let authURL = buildAuthorizationURL(state: expectedState)
            let callbackURL = try await authenticate(url: authURL, scheme: OAuthConfig.callbackScheme)

            let (code, returnedState) = try parseCallback(callbackURL)
            guard returnedState == expectedState else { throw AuthError.stateMismatch }

            let newToken = try await exchangeCodeForToken(code: code)
            persist(newToken)
            state = .signedIn
        } catch {
            // A user cancelling the web sheet isn't an error worth surfacing.
            if case ASWebAuthenticationSessionError.canceledLogin = error {
                state = token == nil ? .signedOut : .signedIn
            } else {
                errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
                state = token == nil ? .signedOut : .signedIn
            }
        }
    }

    // MARK: - Access tokens

    /// Returns a valid access token, refreshing it first if it has expired.
    func validAccessToken() async throws -> String {
        guard let current = token else { throw AuthError.notSignedIn }
        guard current.isExpired else { return current.accessToken }
        let refreshed = try await refresh(current)
        return refreshed.accessToken
    }

    // MARK: - OAuth helpers

    private func buildAuthorizationURL(state: String) -> URL {
        var components = URLComponents(url: OAuthConfig.authorizationEndpoint, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "client_id", value: OAuthConfig.clientID),
            URLQueryItem(name: "redirect_uri", value: OAuthConfig.redirectURI),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "state", value: state),
        ]
        return components.url!
    }

    private func parseCallback(_ url: URL) throws -> (code: String, state: String?) {
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let items = components?.queryItems ?? []
        guard let code = items.first(where: { $0.name == "code" })?.value, !code.isEmpty else {
            throw AuthError.missingCode
        }
        let state = items.first(where: { $0.name == "state" })?.value
        return (code, state)
    }

    private func authenticate(url: URL, scheme: String) async throws -> URL {
        try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: scheme) { callbackURL, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let callbackURL {
                    continuation.resume(returning: callbackURL)
                } else {
                    continuation.resume(throwing: AuthError.missingCode)
                }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            webAuthSession = session
            if !session.start() {
                continuation.resume(throwing: AuthError.cannotStartSession)
            }
        }
    }

    private func exchangeCodeForToken(code: String) async throws -> StoredToken {
        let params = [
            "grant_type": "authorization_code",
            "client_id": OAuthConfig.clientID,
            "client_secret": OAuthConfig.clientSecret,
            "redirect_uri": OAuthConfig.redirectURI,
            "code": code,
        ]
        let response = try await postTokenRequest(params)
        return StoredToken(from: response)
    }

    private func refresh(_ current: StoredToken) async throws -> StoredToken {
        guard let refreshToken = current.refreshToken else {
            signOut()
            throw AuthError.notSignedIn
        }
        let params = [
            "grant_type": "refresh_token",
            "client_id": OAuthConfig.clientID,
            "client_secret": OAuthConfig.clientSecret,
            "refresh_token": refreshToken,
        ]
        let response = try await postTokenRequest(params)
        var refreshed = StoredToken(from: response)
        // Monzo usually returns a fresh refresh token; keep the old one if not.
        if refreshed.refreshToken == nil {
            refreshed.refreshToken = current.refreshToken
        }
        persist(refreshed)
        return refreshed
    }

    private func postTokenRequest(_ params: [String: String]) async throws -> TokenResponse {
        var request = URLRequest(url: OAuthConfig.tokenEndpoint)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        request.httpBody = Self.formEncode(params)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw AuthError.tokenRequestFailed(status: -1, body: nil)
        }
        guard (200...299).contains(http.statusCode) else {
            throw AuthError.tokenRequestFailed(status: http.statusCode, body: String(data: data, encoding: .utf8))
        }
        return try JSONDecoder().decode(TokenResponse.self, from: data)
    }

    private func persist(_ newToken: StoredToken) {
        token = newToken
        if let data = try? JSONEncoder().encode(newToken) {
            try? keychain.save(data, account: tokenAccount)
        }
    }

    private static func formEncode(_ params: [String: String]) -> Data {
        var allowed = CharacterSet.alphanumerics
        allowed.insert(charactersIn: "-._~")
        let body = params.map { key, value in
            let k = key.addingPercentEncoding(withAllowedCharacters: allowed) ?? key
            let v = value.addingPercentEncoding(withAllowedCharacters: allowed) ?? value
            return "\(k)=\(v)"
        }.joined(separator: "&")
        return Data(body.utf8)
    }
}

// MARK: - Presentation context

extension AuthManager: ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        let scenes = UIApplication.shared.connectedScenes
        let window = scenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }
        return window ?? ASPresentationAnchor()
    }
}
