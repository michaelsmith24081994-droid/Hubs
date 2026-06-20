import Foundation

// MARK: - OAuth tokens

/// The raw token payload returned by Monzo's token endpoint.
struct TokenResponse: Decodable {
    let accessToken: String
    let refreshToken: String?
    let expiresIn: Int
    let tokenType: String

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresIn = "expires_in"
        case tokenType = "token_type"
    }
}

/// The token bundle we persist in the Keychain.
struct StoredToken: Codable {
    var accessToken: String
    var refreshToken: String?
    var expiresAt: Date

    init(accessToken: String, refreshToken: String?, expiresAt: Date) {
        self.accessToken = accessToken
        self.refreshToken = refreshToken
        self.expiresAt = expiresAt
    }

    init(from response: TokenResponse) {
        self.accessToken = response.accessToken
        self.refreshToken = response.refreshToken
        self.expiresAt = Date().addingTimeInterval(TimeInterval(response.expiresIn))
    }

    /// Treat the token as expired a minute early to avoid races.
    var isExpired: Bool {
        Date() >= expiresAt.addingTimeInterval(-60)
    }
}

// MARK: - Accounts

struct AccountsResponse: Decodable {
    let accounts: [Account]
}

struct Account: Decodable, Identifiable {
    let id: String
    let description: String
    let created: Date
    let closed: Bool?
    let type: String?

    /// A friendly label for the account.
    var displayName: String {
        switch type {
        case "uk_retail": return "Current account"
        case "uk_retail_joint": return "Joint account"
        case "uk_monzo_flex": return "Flex"
        default: return description.isEmpty ? "Account" : description
        }
    }
}

// MARK: - Balance

struct Balance: Decodable {
    let balance: Int
    let totalBalance: Int?
    let currency: String
    let spendToday: Int?

    enum CodingKeys: String, CodingKey {
        case balance
        case totalBalance = "total_balance"
        case currency
        case spendToday = "spend_today"
    }
}

// MARK: - Transactions

struct TransactionsResponse: Decodable {
    let transactions: [Transaction]
}

struct Merchant: Decodable {
    let id: String?
    let name: String?
    let category: String?
    let emoji: String?
    let logo: String?
}

struct Transaction: Decodable, Identifiable {
    let id: String
    let created: Date
    /// Amount in minor units (pence). Negative for money leaving the account.
    let amount: Int
    let currency: String
    let description: String
    let notes: String?
    let category: String?
    let merchant: Merchant?

    enum CodingKeys: String, CodingKey {
        case id, created, amount, currency, description, notes, category, merchant
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        created = try c.decode(Date.self, forKey: .created)
        amount = try c.decode(Int.self, forKey: .amount)
        currency = try c.decode(String.self, forKey: .currency)
        description = (try? c.decode(String.self, forKey: .description)) ?? ""
        notes = try? c.decode(String.self, forKey: .notes)
        category = try? c.decode(String.self, forKey: .category)
        // `merchant` is an object when expanded, a bare id string otherwise,
        // or null for things like top-ups — tolerate all three.
        merchant = try? c.decodeIfPresent(Merchant.self, forKey: .merchant)
    }
}

extension Transaction {
    var isCredit: Bool { amount >= 0 }

    var displayTitle: String {
        if let name = merchant?.name, !name.isEmpty { return name }
        if !description.isEmpty { return description }
        return "Transaction"
    }

    var formattedAmount: String {
        Money.format(minorUnits: amount, currency: currency)
    }
}

// MARK: - Money formatting

enum Money {
    static func format(minorUnits amount: Int, currency: String) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        let value = Double(amount) / 100.0
        return formatter.string(from: NSNumber(value: value)) ?? String(format: "%.2f", value)
    }
}
