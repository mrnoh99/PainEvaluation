import Foundation

/// 통증 평가 항목 종류 (1~4번 항목)
enum PainItemKind: Int, CaseIterable, Identifiable {
    case pain          // 1. 통증
    case depression    // 2. 우울감
    case dissociation  // 3. 해리, 이인
    case sleep         // 4. 잠

    var id: Int { rawValue }

    var index: Int { rawValue + 1 }

    var title: String {
        switch self {
        case .pain: return "통증"
        case .depression: return "우울감"
        case .dissociation: return "해리, 이인"
        case .sleep: return "잠"
        }
    }

    /// 채점 기준이 되는 세부 정도 항목명 (인쇄물 헤더 기준)
    var scaleTitle: String {
        switch self {
        case .pain: return "통증의 정도"
        case .depression, .dissociation, .sleep: return "증상의 정도"
        }
    }
}

/// 특정 점수 구간에 대한 설명
struct RubricLevel {
    let scores: ClosedRange<Int>
    let text: String

    /// 목록 표시용 점수 라벨 ("10", "7–9" 등)
    var label: String {
        scores.lowerBound == scores.upperBound
            ? "\(scores.lowerBound)"
            : "\(scores.lowerBound)–\(scores.upperBound)"
    }
}

/// 인쇄된 채점표를 그대로 옮긴 항목별 채점 기준.
enum PainRubric {

    // 1. 통증 — 통증의 정도 (0~10)
    static let pain: [RubricLevel] = [
        .init(scores: 10...10, text: "움직이기 불가능. 화장실 및 식사 불가능"),
        .init(scores: 9...9,   text: "해리, 이인증이 동반되어 기억이 잘 나지 않는다"),
        .init(scores: 7...8,   text: "충동(자살시도, 자해, 폭력성). 주로 집에서만 지낸다"),
        .init(scores: 5...6,   text: "산책, 뛰기, 담배피기 등으로 전환할 수 있다. 주변에서 변화를 알아차릴 수 있는 수준"),
        .init(scores: 4...4,   text: "우울하다는 사실을 확실하게 알게 됨. 아르바이트, 공부 등 하기 싫은 일을 피하기 시작함"),
        .init(scores: 3...3,   text: "친구를 만나 전환할 수 있다. 티가 나지 않으며 굳이 도움을 받고 싶지 않은 수준"),
        .init(scores: 2...2,   text: "편안한 상태. 하기 싫어도 해야 한다면 아르바이트, 공부를 할 수 있다"),
        .init(scores: 1...1,   text: "하고 싶은 것이 생기지만 조증 상태는 아니다. 아르바이트 찾기, 적금 들기, 적극적, 잠 안 자기"),
        .init(scores: 0...0,   text: "해당 없음"),
    ]

    // 2. 우울감 — 증상의 정도 (0~10)
    static let depression: [RubricLevel] = [
        .init(scores: 10...10, text: "심리적, 신체적인 에너지 사용이 불가하다. 도움을 필요로 한다"),
        .init(scores: 8...9,   text: "(이후로는 증상 악화로 도움 청하기가 어려움)"),
        .init(scores: 7...7,   text: "에너지가 줄어드는 것이 느껴짐"),
        .init(scores: 5...6,   text: "혼자서 이겨내기 힘든 수준"),
        .init(scores: 2...4,   text: "그냥저냥 지내며 버틸 만한 우울감"),
        .init(scores: 0...1,   text: "좋지도 나쁘지도 않음"),
    ]

    // 3. 해리, 이인 — 증상의 정도
    static let dissociation: [RubricLevel] = [
        .init(scores: 10...10, text: "기억이 없다. 사고가 난다"),
        .init(scores: 7...9,   text: "현실과 꿈을 구분할 수 없다"),
        .init(scores: 5...6,   text: "행동을 통제할 수 없다. 타인과 대화를 하더라도 제3자로 보는 느낌이 든다"),
        .init(scores: 1...4,   text: "기억력이 저하된다. 멍하다. 꿈을 꾸는 것 같다"),
        .init(scores: 0...0,   text: "해당 없음"),
    ]

    // 4. 잠 — 증상의 정도
    static let sleep: [RubricLevel] = [
        .init(scores: 10...10, text: "화장실에 가거나 식사를 하지 못하고 수면한다"),
        .init(scores: 7...9,   text: "화장실에 갈 수 있다. 식사할 수 있다"),
        .init(scores: 0...6,   text: "적절히 수면한다 (12시간 정도)"),
    ]

    static func levels(for kind: PainItemKind) -> [RubricLevel] {
        switch kind {
        case .pain: return pain
        case .depression: return depression
        case .dissociation: return dissociation
        case .sleep: return sleep
        }
    }

    /// 주어진 점수에 해당하는 설명 문구
    static func description(for kind: PainItemKind, score: Int) -> String {
        levels(for: kind).first { $0.scores.contains(score) }?.text ?? ""
    }
}
