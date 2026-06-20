// swift-tools-version: 5.9

// This is a Swift Playgrounds App Project. Open the enclosing
// "MonzoSpending.swiftpm" folder with Swift Playgrounds on iPhone or iPad
// (or with Xcode on a Mac) and press Run.

import PackageDescription
import AppleProductTypes

let package = Package(
    name: "MonzoSpending",
    platforms: [
        .iOS("17.0")
    ],
    products: [
        .iOSApplication(
            name: "MonzoSpending",
            targets: ["AppModule"],
            bundleIdentifier: "com.example.MonzoSpending",
            teamIdentifier: "",
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .moneyBag),
            accentColor: .presetColor(.orange),
            supportedDeviceFamilies: [
                .pad,
                .phone
            ],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft,
                .portraitUpsideDown(.when(deviceFamilies: [.pad]))
            ]
        )
    ],
    targets: [
        .executableTarget(
            name: "AppModule",
            path: "."
        )
    ]
)
