import SwiftUI

@MainActor
@Observable
final class TransactionsViewModel {
    var isLoading = false
    var errorMessage: String?
    var account: Account?
    var balance: Balance?
    var transactions: [Transaction] = []

    /// Transactions newest-first.
    var sortedTransactions: [Transaction] {
        transactions.sorted { $0.created > $1.created }
    }

    /// Total spent (outgoing) so far this calendar month, in minor units.
    var spentThisMonth: Int {
        let calendar = Calendar.current
        let now = Date()
        let monthStart = calendar.date(from: calendar.dateComponents([.year, .month], from: now)) ?? now
        return transactions
            .filter { $0.amount < 0 && $0.created >= monthStart }
            .reduce(0) { $0 + $1.amount }
    }

    /// Transactions grouped by day, newest day first.
    var sections: [(date: Date, items: [Transaction])] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: sortedTransactions) {
            calendar.startOfDay(for: $0.created)
        }
        return grouped
            .map { (date: $0.key, items: $0.value) }
            .sorted { $0.date > $1.date }
    }

    func load(auth: AuthManager) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        let client = MonzoAPIClient(auth: auth)
        do {
            let accounts = try await client.accounts()
            guard let account = accounts.first else {
                errorMessage = "No open Monzo accounts were found."
                return
            }
            self.account = account

            // Non-SCA access is limited to the last 90 days, so request 89.
            let since = Calendar.current.date(byAdding: .day, value: -89, to: Date())
            async let balance = client.balance(accountID: account.id)
            async let transactions = client.transactions(accountID: account.id, since: since)

            self.balance = try await balance
            self.transactions = try await transactions
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        }
    }
}

struct TransactionsView: View {
    @Environment(AuthManager.self) private var auth
    @State private var model = TransactionsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if model.isLoading && model.transactions.isEmpty {
                    ProgressView("Loading transactions…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = model.errorMessage, model.transactions.isEmpty {
                    ContentUnavailableView {
                        Label("Couldn't load data", systemImage: "exclamationmark.triangle")
                    } description: {
                        Text(errorMessage)
                    } actions: {
                        Button("Try Again") {
                            Task { await model.load(auth: auth) }
                        }
                    }
                } else {
                    transactionList
                }
            }
            .navigationTitle("Spending")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Refresh", systemImage: "arrow.clockwise") {
                            Task { await model.load(auth: auth) }
                        }
                        Button("Sign Out", systemImage: "rectangle.portrait.and.arrow.right", role: .destructive) {
                            auth.signOut()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .task {
            if model.transactions.isEmpty {
                await model.load(auth: auth)
            }
        }
    }

    private var transactionList: some View {
        List {
            Section {
                summaryHeader
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
            }

            ForEach(model.sections, id: \.date) { section in
                Section(sectionTitle(for: section.date)) {
                    ForEach(section.items) { transaction in
                        TransactionRow(transaction: transaction)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable {
            await model.load(auth: auth)
        }
    }

    private var summaryHeader: some View {
        VStack(spacing: 16) {
            if let balance = model.balance {
                VStack(spacing: 4) {
                    Text("Balance")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(Money.format(minorUnits: balance.balance, currency: balance.currency))
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                }
            }

            HStack(spacing: 12) {
                summaryTile(
                    title: "Spent this month",
                    value: Money.format(minorUnits: abs(model.spentThisMonth), currency: currencyCode)
                )
                if let spendToday = model.balance?.spendToday {
                    summaryTile(
                        title: "Spent today",
                        value: Money.format(minorUnits: abs(spendToday), currency: currencyCode)
                    )
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
    }

    private func summaryTile(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
    }

    private var currencyCode: String {
        model.balance?.currency ?? model.transactions.first?.currency ?? "GBP"
    }

    private func sectionTitle(for date: Date) -> String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) { return "Today" }
        if calendar.isDateInYesterday(date) { return "Yesterday" }
        return date.formatted(.dateTime.weekday(.wide).day().month(.wide))
    }
}

struct TransactionRow: View {
    let transaction: Transaction

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(.quaternary)
                    .frame(width: 40, height: 40)
                Text(transaction.merchant?.emoji ?? "💳")
                    .font(.title3)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.displayTitle)
                    .font(.body)
                    .lineLimit(1)
                Text(transaction.created.formatted(date: .omitted, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(transaction.formattedAmount)
                .font(.body.weight(.semibold))
                .foregroundStyle(transaction.isCredit ? .green : .primary)
        }
        .padding(.vertical, 2)
    }
}
