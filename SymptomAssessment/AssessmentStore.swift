import Foundation
import Combine

/// 모든 평가 기록을 보관하고 UserDefaults에 영속화하는 저장소.
final class AssessmentStore: ObservableObject {
    @Published var painRecords: [PainRecord] = [] { didSet { save() } }
    @Published var maniaRecords: [ManiaRecord] = [] { didSet { save() } }

    private let painKey = "painRecords.v1"
    private let maniaKey = "maniaRecords.v1"

    init() { load() }

    // MARK: 추가 / 삭제

    func add(_ record: PainRecord) {
        painRecords.append(record)
        painRecords.sort { $0.date < $1.date }
    }

    func add(_ record: ManiaRecord) {
        maniaRecords.append(record)
        maniaRecords.sort { $0.date < $1.date }
    }

    func deletePain(at offsets: IndexSet) { painRecords.remove(atOffsets: offsets) }
    func deleteMania(at offsets: IndexSet) { maniaRecords.remove(atOffsets: offsets) }

    func clearAll() {
        painRecords = []
        maniaRecords = []
    }

    // MARK: 결과 분석 - 통합 타임라인

    /// 같은 날짜/시간(분 단위)의 두 평가를 하나의 시점으로 병합해 시간순으로 반환.
    var timeline: [TimelinePoint] {
        var buckets: [Date: TimelinePoint] = [:]
        let cal = Calendar.current

        func bucketKey(_ date: Date) -> Date {
            let c = cal.dateComponents([.year, .month, .day, .hour, .minute], from: date)
            return cal.date(from: c) ?? date
        }

        for r in painRecords {
            let key = bucketKey(r.date)
            var point = buckets[key] ?? TimelinePoint(date: key)
            point.painTotal = r.total
            buckets[key] = point
        }
        for r in maniaRecords {
            let key = bucketKey(r.date)
            var point = buckets[key] ?? TimelinePoint(date: key)
            point.maniaTotal = r.total
            buckets[key] = point
        }
        return buckets.values.sorted { $0.date < $1.date }
    }

    // MARK: 영속화

    private func save() {
        let enc = JSONEncoder()
        if let p = try? enc.encode(painRecords) {
            UserDefaults.standard.set(p, forKey: painKey)
        }
        if let m = try? enc.encode(maniaRecords) {
            UserDefaults.standard.set(m, forKey: maniaKey)
        }
    }

    private func load() {
        let dec = JSONDecoder()
        if let p = UserDefaults.standard.data(forKey: painKey),
           let decoded = try? dec.decode([PainRecord].self, from: p) {
            painRecords = decoded.sorted { $0.date < $1.date }
        }
        if let m = UserDefaults.standard.data(forKey: maniaKey),
           let decoded = try? dec.decode([ManiaRecord].self, from: m) {
            maniaRecords = decoded.sorted { $0.date < $1.date }
        }
    }
}

// MARK: - 공용 포맷터

enum Fmt {
    static let dateTime: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ko_KR")
        f.dateFormat = "M/d HH:mm"
        return f
    }()

    static let fullDateTime: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ko_KR")
        f.dateFormat = "yyyy년 M월 d일 HH:mm"
        return f
    }()

    static let shortDate: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ko_KR")
        f.dateFormat = "M/d"
        return f
    }()
}
