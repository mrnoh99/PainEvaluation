import Foundation

// MARK: - 통증 평가 기록

/// 통증 평가: 4개 항목을 0~10점으로 채점하며 총점은 /40.
struct PainRecord: Identifiable, Codable, Equatable {
    var id = UUID()
    var date: Date
    var pain: Int          // 1. 통증
    var depression: Int    // 2. 우울감
    var dissociation: Int  // 3. 해리, 이인
    var sleep: Int         // 4. 잠

    /// 각 항목 점수의 합 (0~40)
    var total: Int { pain + depression + dissociation + sleep }
}

// MARK: - 조증의 진단 기록

/// 조증의 진단: 7개 문항에 대해 예(1점)/아니요(0점)로 응답. 총점 /7.
struct ManiaRecord: Identifiable, Codable, Equatable {
    var id = UUID()
    var date: Date
    var answers: [Bool]    // 7개 문항 응답 (true = 예)

    /// "예"로 응답한 문항 수 (0~7)
    var total: Int { answers.filter { $0 }.count }

    static let questions: [String] = [
        "팽창된 자존심 또는 심하게 과장된 자신감이 있다.",
        "수면에 대한 욕구가 감소한다. 예를 들어 단 3시간의 수면으로도 충분하다고 느낀다.",
        "평소보다 말이 많아지거나 계속 말을 하게 된다.",
        "사고의 비약 또는 생각이 쉴 새 없이 빠르게 이어진다.",
        "주의가 산만해진다. 불필요한 외부 자극에 너무 쉽게 주의가 이끌린다.",
        "새로운 일을 많이 벌이고 활동이 증가하거나 초조해서 안절부절 못한다.",
        "흥청망청 물건사기, 무분별한 성행위, 어리석은 사업투자 등 고통스런 결과를 초래할 수 있는 쾌락활동에 지나치게 몰두한다.",
    ]
}

// MARK: - 결과 분석용 통합 데이터

/// 날짜/시간 기준으로 두 평가 점수를 하나의 시점으로 묶은 항목.
struct TimelinePoint: Identifiable {
    var id = UUID()
    var date: Date
    var painTotal: Int?    // 통증 평가 총점 (/40)
    var maniaTotal: Int?   // 조증 진단 총점 (/7)
}
