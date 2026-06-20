import SwiftUI

struct LoginView: View {
    @Environment(AuthManager.self) private var auth

    private var isAuthenticating: Bool {
        if case .authenticating = auth.state { return true }
        return false
    }

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "creditcard.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(.tint)

            VStack(spacing: 8) {
                Text("Monzo Spending")
                    .font(.largeTitle.bold())
                Text("Track your spending and savings.")
                    .font(.body)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if !OAuthConfig.isConfigured {
                Label(
                    "Add your Monzo client ID and secret in OAuthConfig.swift before signing in.",
                    systemImage: "exclamationmark.triangle.fill"
                )
                .font(.footnote)
                .foregroundStyle(.orange)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            }

            if let errorMessage = auth.errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Button {
                Task { await auth.signIn() }
            } label: {
                HStack {
                    if isAuthenticating {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(isAuthenticating ? "Connecting…" : "Connect Monzo")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .disabled(isAuthenticating || !OAuthConfig.isConfigured)
            .padding(.horizontal)

            Text("You'll be asked to approve access in the Monzo app.")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .padding(.bottom)
        }
        .padding()
    }
}

#Preview {
    LoginView()
        .environment(AuthManager())
}
