import SwiftUI

struct RootView: View {
    @Environment(AuthManager.self) private var auth

    var body: some View {
        switch auth.state {
        case .signedOut, .authenticating:
            LoginView()
        case .signedIn:
            TransactionsView()
        }
    }
}

#Preview {
    RootView()
        .environment(AuthManager())
}
