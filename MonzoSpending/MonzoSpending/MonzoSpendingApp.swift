import SwiftUI

@main
struct MonzoSpendingApp: App {
    @State private var auth = AuthManager()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(auth)
        }
    }
}
