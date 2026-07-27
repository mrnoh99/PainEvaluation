import SwiftUI
import Charts

struct AnalysisView: View {
    @EnvironmentObject var store: AssessmentStore
    @State private var showClearConfirm = false

    private let painMax = 40.0
    private let maniaMax = 7.0

    private var points: [TimelinePoint] { store.timeline }

    var body: some View {
        NavigationStack {
            Group {
                if points.isEmpty {
                    ContentUnavailableCompat(
                        title: "분석할 데이터가 없습니다.",
                        message: "통증 평가와 조증 진단을 먼저 기록해 주세요."
                    )
                } else {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 24) {
                            chartSection
                            tableSection
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("결과 분석")
            .toolbar {
                if !(store.painRecords.isEmpty && store.maniaRecords.isEmpty) {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button(role: .destructive) {
                            showClearConfirm = true
                        } label: {
                            Image(systemName: "trash")
                        }
                    }
                }
            }
            .confirmationDialog("모든 기록을 삭제할까요?", isPresented: $showClearConfirm, titleVisibility: .visible) {
                Button("전체 삭제", role: .destructive) { store.clearAll() }
                Button("취소", role: .cancel) {}
            }
        }
    }

    // MARK: 그래프

    private var chartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("점수 변화 그래프")
                .font(.headline)

            HStack(spacing: 16) {
                legendItem(color: .red, text: "통증 평가 (/40)")
                legendItem(color: .purple, text: "조증 진단 (/7)")
            }
            .font(.caption)

            Chart {
                ForEach(points) { p in
                    if let pain = p.painTotal {
                        LineMark(
                            x: .value("시각", p.date),
                            y: .value("통증", Double(pain)),
                            series: .value("항목", "통증")
                        )
                        .foregroundStyle(.red)
                        .symbol(.circle)
                        PointMark(
                            x: .value("시각", p.date),
                            y: .value("통증", Double(pain))
                        )
                        .foregroundStyle(.red)
                        .annotation(position: .top) {
                            Text("\(pain)").font(.caption2).foregroundStyle(.red)
                        }
                    }
                    if let mania = p.maniaTotal {
                        // 조증 점수(/7)를 통증 축(/40)에 맞춰 환산해 함께 표시
                        let scaled = Double(mania) * painMax / maniaMax
                        LineMark(
                            x: .value("시각", p.date),
                            y: .value("조증", scaled),
                            series: .value("항목", "조증")
                        )
                        .foregroundStyle(.purple)
                        .symbol(.circle)
                        PointMark(
                            x: .value("시각", p.date),
                            y: .value("조증", scaled)
                        )
                        .foregroundStyle(.purple)
                        .annotation(position: .bottom) {
                            Text("\(mania)").font(.caption2).foregroundStyle(.purple)
                        }
                    }
                }
            }
            .chartYScale(domain: 0...painMax)
            .chartYAxis {
                // 좌측: 통증(/40)
                AxisMarks(position: .leading, values: [0.0, 10, 20, 30, 40]) { value in
                    AxisGridLine()
                    AxisTick()
                    AxisValueLabel {
                        if let v = value.as(Double.self) {
                            Text("\(Int(v))").foregroundStyle(.red)
                        }
                    }
                }
                // 우측: 조증(/7) 환산 눈금
                AxisMarks(position: .trailing, values: [0.0, 10, 20, 30, 40]) { value in
                    AxisValueLabel {
                        if let v = value.as(Double.self) {
                            let mania = v * maniaMax / painMax
                            Text(String(format: "%.0f", mania)).foregroundStyle(.purple)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks { value in
                    AxisGridLine()
                    AxisValueLabel {
                        if let d = value.as(Date.self) {
                            Text(Fmt.dateTime.string(from: d))
                                .font(.caption2)
                        }
                    }
                }
            }
            .frame(height: 300)
        }
    }

    private func legendItem(color: Color, text: String) -> some View {
        HStack(spacing: 6) {
            Circle().fill(color).frame(width: 10, height: 10)
            Text(text).foregroundStyle(.secondary)
        }
    }

    // MARK: 통합 표

    private var tableSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("통합 표")
                .font(.headline)

            HStack {
                Text("날짜/시간").frame(maxWidth: .infinity, alignment: .leading)
                Text("통증 /40").frame(width: 80, alignment: .trailing)
                Text("조증 /7").frame(width: 70, alignment: .trailing)
            }
            .font(.caption.bold())
            .foregroundStyle(.secondary)

            Divider()

            ForEach(points) { p in
                HStack {
                    Text(Fmt.fullDateTime.string(from: p.date))
                        .font(.caption)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text(p.painTotal.map { "\($0)" } ?? "—")
                        .frame(width: 80, alignment: .trailing)
                        .foregroundStyle(.red)
                    Text(p.maniaTotal.map { "\($0)" } ?? "—")
                        .frame(width: 70, alignment: .trailing)
                        .foregroundStyle(.purple)
                }
                .font(.callout)
                .monospacedDigit()
                Divider()
            }
        }
    }
}

/// iOS 16 호환용 빈 상태 표시 (ContentUnavailableView는 iOS 17+).
struct ContentUnavailableCompat: View {
    let title: String
    let message: String
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "chart.xyaxis.line")
                .font(.largeTitle)
                .foregroundStyle(.secondary)
            Text(title).font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

#Preview {
    AnalysisView().environmentObject(AssessmentStore())
}
