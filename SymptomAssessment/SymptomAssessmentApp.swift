import SwiftUI

@main
struct SymptomAssessmentApp: App {
    @StateObject private var store = AssessmentStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
