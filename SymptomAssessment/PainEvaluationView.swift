import SwiftUI

struct PainEvaluationView: View {
    @EnvironmentObject var store: AssessmentStore

    @State private var date = Date()
    @State private var scores: [PainItemKind: Int] = [
        .pain: 0, .depression: 0, .dissociation: 0, .sleep: 0,
    ]
    @State private var showSaved = false

    private var total: Int { scores.values.reduce(0, +) }

    var body: some View {
        NavigationStack {
            Form {
                Section("날짜 및 시간") {
                    DatePicker("측정 시각", selection: $date)
                        .datePickerStyle(.compact)
                }

                ForEach(PainItemKind.allCases) { kind in
                    itemSection(kind)
                }

                Section {
                    HStack {
                        Text("총점")
                            .font(.headline)
                        Spacer()
                        Text("\(total) / 40")
                            .font(.title3.bold())
                            .foregroundStyle(.blue)
                    }
                }

                Section {
                    Button {
                        save()
                    } label: {
                        Text("기록 저장")
                            .frame(maxWidth: .infinity)
                            .fontWeight(.semibold)
                    }
                }

                if !store.painRecords.isEmpty {
                    Section("저장된 기록") {
                        ForEach(store.painRecords.reversed()) { r in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(Fmt.fullDateTime.string(from: r.date))
                                        .font(.subheadline)
                                    Text("통증 \(r.pain) · 우울 \(r.depression) · 해리 \(r.dissociation) · 잠 \(r.sleep)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("\(r.total)/40")
                                    .font(.headline)
                                    .foregroundStyle(.blue)
                            }
                        }
                        .onDelete { store.deletePain(at: reversedOffsets($0, count: store.painRecords.count)) }
                    }
                }
            }
            .navigationTitle("통증 평가")
            .alert("기록이 저장되었습니다.", isPresented: $showSaved) {
                Button("확인", role: .cancel) {}
            }
        }
    }

    // MARK: 항목별 채점 섹션

    private func itemSection(_ kind: PainItemKind) -> some View {
        let score = scores[kind] ?? 0
        return Section("\(kind.index). \(kind.title) — \(kind.scaleTitle)") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("점수")
                        .font(.subheadline)
                    Spacer()
                    Text("\(score)점")
                        .font(.headline.monospacedDigit())
                        .foregroundStyle(.blue)
                }

                Slider(
                    value: Binding(
                        get: { Double(scores[kind] ?? 0) },
                        set: { scores[kind] = Int($0.rounded()) }
                    ),
                    in: 0...10,
                    step: 1
                ) {
                    Text(kind.title)
                } minimumValueLabel: {
                    Text("0").font(.caption2).foregroundStyle(.secondary)
                } maximumValueLabel: {
                    Text("10").font(.caption2).foregroundStyle(.secondary)
                }

                // 현재 점수에 해당하는 채점 기준 설명
                Text(PainRubric.description(for: kind, score: score))
                    .font(.callout)
                    .foregroundStyle(score == 0 ? .secondary : .primary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(10)
                    .background(Color.blue.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .padding(.vertical, 4)

            // 항목별 전체 채점 기준을 접어서 참고
            DisclosureGroup("채점 기준 보기") {
                ForEach(PainRubric.levels(for: kind), id: \.label) { level in
                    HStack(alignment: .top, spacing: 10) {
                        Text(level.label)
                            .font(.caption.bold().monospacedDigit())
                            .frame(width: 40, alignment: .leading)
                            .foregroundStyle(.blue)
                        Text(level.text)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }

    private func save() {
        let record = PainRecord(
            date: date,
            pain: scores[.pain] ?? 0,
            depression: scores[.depression] ?? 0,
            dissociation: scores[.dissociation] ?? 0,
            sleep: scores[.sleep] ?? 0
        )
        store.add(record)
        scores = [.pain: 0, .depression: 0, .dissociation: 0, .sleep: 0]
        date = Date()
        showSaved = true
    }
}

/// `.reversed()`로 표시된 목록의 삭제 오프셋을 원본 배열 인덱스로 변환.
func reversedOffsets(_ offsets: IndexSet, count: Int) -> IndexSet {
    IndexSet(offsets.map { count - 1 - $0 })
}

#Preview {
    PainEvaluationView().environmentObject(AssessmentStore())
}
