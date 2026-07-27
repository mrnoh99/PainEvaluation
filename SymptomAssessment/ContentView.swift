import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            PainEvaluationView()
                .tabItem { Label("통증 평가", systemImage: "waveform.path.ecg") }

            ManiaDiagnosisView()
                .tabItem { Label("조증의 진단", systemImage: "checklist") }

            AnalysisView()
                .tabItem { Label("결과 분석", systemImage: "chart.xyaxis.line") }
        }
    }
}

#Preview {
    ContentView().environmentObject(AssessmentStore())
}
