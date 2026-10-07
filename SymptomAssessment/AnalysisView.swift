import SwiftUI
import Charts

struct AnalysisView: View {
    @EnvironmentObject var store: AssessmentStore
    @State private var showClearConfirm = false

    private let painMax = 40.0
    private let maniaMax = 7.0

    // 그래프 조작 상태
    @State private var committedVisible: Double = 7      // 한 화면에 보일 데이터 개수(세로 7 / 넓으면 14)
    @GestureState private var magnify: CGFloat = 1       // 핀치 진행 중 배율(실시간)
    @State private var scrollX: Double = 0               // 가로 스크롤 위치(인덱스 기준)

    private var points: [TimelinePoint] { store.timeline }

    // 핀치로 벌리면 보이는 개수가 줄어(간격이 넓어지고 확대), 오므리면 늘어남
    private var visibleCount: Double {
        min(max(committedVisible / Double(magnify), 3), 40)
    }
    private var showValues: Bool { visibleCount <= 8 }    // 간격 넓을 때만 점 위 숫자

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

    // MARK: 그래프 (가로 스크롤 + 핀치로 간격 조절)

    private var chartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("점수 변화 그래프")
                .font(.headline)

            HStack(spacing: 16) {
                legendItem(color: .red, text: "통증 평가 (/40)")
                legendItem(color: .purple, text: "조증 진단 (/7)")
            }
            .font(.caption)

            Text("한 손가락으로 좌우 이동 · 두 손가락으로 간격 조절")
                .font(.caption2)
                .foregroundStyle(.secondary)

            GeometryReader { geo in
                chart
                    .onAppear {
                        committedVisible = geo.size.width >= 600 ? 14 : 7
                        scrollToLatest()
                    }
                    .onChange(of: geo.size.width) { _, w in
                        committedVisible = w >= 600 ? 14 : 7   // 회전/크기 변경 시 기본값 재적용
                        scrollToLatest()
                    }
            }
            .frame(height: 300)
        }
    }

    private var chart: some View {
        Chart {
            ForEach(Array(points.enumerated()), id: \.element.id) { idx, p in
                if let pain = p.painTotal {
                    LineMark(x: .value("순서", Double(idx)),
                             y: .value("통증", Double(pain)),
                             series: .value("항목", "통증"))
                        .foregroundStyle(.red)
                    PointMark(x: .value("순서", Double(idx)),
                              y: .value("통증", Double(pain)))
                        .foregroundStyle(.red)
                        .annotation(position: .top) {
                            if showValues { Text("\(pain)").font(.caption2).foregroundStyle(.red) }
                        }
                }
                if let mania = p.maniaTotal {
                    let scaled = Double(mania) * painMax / maniaMax   // /7 점수를 /40 축에 맞춰 환산
                    LineMark(x: .value("순서", Double(idx)),
                             y: .value("조증", scaled),
                             series: .value("항목", "조증"))
                        .foregroundStyle(.purple)
                    PointMark(x: .value("순서", Double(idx)),
                              y: .value("조증", scaled))
                        .foregroundStyle(.purple)
                        .annotation(position: .bottom) {
                            if showValues { Text("\(mania)").font(.caption2).foregroundStyle(.purple) }
                        }
                }
            }
        }
        .chartYScale(domain: 0...painMax)
        .chartYAxis {
            AxisMarks(position: .leading, values: [0.0, 10, 20, 30, 40]) { value in
                AxisGridLine(); AxisTick()
                AxisValueLabel {
                    if let v = value.as(Double.self) { Text("\(Int(v))").foregroundStyle(.red) }
                }
            }
            AxisMarks(position: .trailing, values: [0.0, 10, 20, 30, 40]) { value in
                AxisValueLabel {
                    if let v = value.as(Double.self) {
                        Text(String(format: "%.0f", v * maniaMax / painMax)).foregroundStyle(.purple)
                    }
                }
            }
        }
        .chartXAxis {
            AxisMarks(values: xAxisIndices) { value in
                AxisGridLine()
                AxisValueLabel {
                    if let d = value.as(Double.self) {
                        let i = Int(d.rounded())
                        if i >= 0 && i < points.count {
                            Text(Fmt.shortDate.string(from: points[i].date)).font(.caption2)
                        }
                    }
                }
            }
        }
        .chartScrollableAxes(.horizontal)
        .chartXVisibleDomain(length: visibleCount)
        .chartScrollPosition(x: $scrollX)
        .gesture(
            MagnifyGesture()
                .updating($magnify) { value, state, _ in state = value.magnification }
                .onEnded { value in
                    committedVisible = min(max(committedVisible / Double(value.magnification), 3), 40)
                }
        )
    }

    // 보이는 구간 안의 눈금만 과밀하지 않게: 전체 인덱스를 적당히 솎아서 라벨 표시
    private var xAxisIndices: [Double] {
        let n = points.count
        let step = max(1, Int((visibleCount / 7).rounded()))
        return stride(from: 0, to: n, by: step).map(Double.init)
    }

    private func scrollToLatest() {
        scrollX = max(0, Double(points.count) - visibleCount)
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

/// iOS 16 호환용 빈 상태 표시.
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
