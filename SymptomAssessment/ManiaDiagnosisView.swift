import SwiftUI

struct ManiaDiagnosisView: View {
    @EnvironmentObject var store: AssessmentStore

    @State private var date = Date()
    @State private var answers = [Bool](repeating: false, count: ManiaRecord.questions.count)
    @State private var showSaved = false

    private var total: Int { answers.filter { $0 }.count }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("기분이 들뜨거나 불안정하면서 지나치게 활동이 많아지는 상태가 1주일 이상 지속되면서(입원 시) 대체로 아래 증상 가운데 3가지 이상이 나타나는 경우.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Section("날짜 및 시간") {
                    DatePicker("측정 시각", selection: $date)
                        .datePickerStyle(.compact)
                }

                Section("문항 (예 = 1점 / 아니요 = 0점)") {
                    ForEach(Array(ManiaRecord.questions.enumerated()), id: \.offset) { idx, q in
                        VStack(alignment: .leading, spacing: 8) {
                            Text("\(idx + 1). \(q)")
                                .font(.subheadline)
                            Picker("", selection: $answers[idx]) {
                                Text("예").tag(true)
                                Text("아니요").tag(false)
                            }
                            .pickerStyle(.segmented)
                        }
                        .padding(.vertical, 4)
                    }
                }

                Section {
                    HStack {
                        Text("총점")
                            .font(.headline)
                        Spacer()
                        Text("\(total) / 7")
                            .font(.title3.bold())
                            .foregroundStyle(.purple)
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

                if !store.maniaRecords.isEmpty {
                    Section("저장된 기록") {
                        ForEach(store.maniaRecords.reversed()) { r in
                            HStack {
                                Text(Fmt.fullDateTime.string(from: r.date))
                                    .font(.subheadline)
                                Spacer()
                                Text("\(r.total)/7")
                                    .font(.headline)
                                    .foregroundStyle(.purple)
                            }
                        }
                        .onDelete { store.deleteMania(at: reversedOffsets($0, count: store.maniaRecords.count)) }
                    }
                }
            }
            .navigationTitle("조증의 진단")
            .alert("기록이 저장되었습니다.", isPresented: $showSaved) {
                Button("확인", role: .cancel) {}
            }
        }
    }

    private func save() {
        let record = ManiaRecord(date: date, answers: answers)
        store.add(record)
        answers = [Bool](repeating: false, count: ManiaRecord.questions.count)
        date = Date()
        showSaved = true
    }
}

#Preview {
    ManiaDiagnosisView().environmentObject(AssessmentStore())
}
