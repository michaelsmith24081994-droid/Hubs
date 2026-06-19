import Foundation

enum MonzoAPIError: LocalizedError {
    case invalidResponse
    case unauthorized
    case http(status: Int, body: String?)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Received an invalid response from Monzo."
        case .unauthorized:
            return "Your Monzo session has expired or access was revoked. Please sign in again."
        case .http(let status, let body):
            return "Monzo request failed (HTTP \(status)).\(body.map { " \($0)" } ?? "")"
        }
    }
}

/// A thin client over the Monzo REST API. Pulls a fresh access token from the
/// `AuthManager` for each request.
@MainActor
struct MonzoAPIClient {
    let auth: AuthManager

    func accounts(includeClosed: Bool = false) async throws -> [Account] {
        let data = try await get(path: "/accounts")
        let accounts = try Self.decoder.decode(AccountsResponse.self, from: data).accounts
        return includeClosed ? accounts : accounts.filter { $0.closed != true }
    }

    func balance(accountID: String) async throws -> Balance {
        let data = try await get(
            path: "/balance",
            query: [URLQueryItem(name: "account_id", value: accountID)]
        )
        return try Self.decoder.decode(Balance.self, from: data)
    }

    func transactions(accountID: String, since: Date? = nil) async throws -> [Transaction] {
        var query = [
            URLQueryItem(name: "account_id", value: accountID),
            URLQueryItem(name: "expand[]", value: "merchant"),
        ]
        if let since {
            query.append(URLQueryItem(name: "since", value: ISO8601DateFormatter().string(from: since)))
        }
        let data = try await get(path: "/transactions", query: query)
        return try Self.decoder.decode(TransactionsResponse.self, from: data).transactions
    }

    // MARK: - Request plumbing

    private func get(path: String, query: [URLQueryItem] = []) async throws -> Data {
        let token = try await auth.validAccessToken()

        var components = URLComponents(string: OAuthConfig.apiBaseURL.absoluteString + path)!
        if !query.isEmpty { components.queryItems = query }

        var request = URLRequest(url: components.url!)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw MonzoAPIError.invalidResponse
        }
        switch http.statusCode {
        case 200...299:
            return data
        case 401:
            throw MonzoAPIError.unauthorized
        default:
            throw MonzoAPIError.http(status: http.statusCode, body: String(data: data, encoding: .utf8))
        }
    }

    // MARK: - Decoding

    static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let string = try container.decode(String.self)
            if let date = MonzoDate.parse(string) { return date }
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unrecognised date format: \(string)"
            )
        }
        return decoder
    }()
}

/// Parses Monzo's ISO-8601 timestamps, which sometimes include fractional seconds.
enum MonzoDate {
    private static let withFractional: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static let plain: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func parse(_ string: String) -> Date? {
        withFractional.date(from: string) ?? plain.date(from: string)
    }
}
