# 증상 평가 (Symptom Assessment)

통증 평가와 조증 진단을 기록하고, 두 점수의 변화를 표와 그래프로 분석하는 iOS(iPhone) 앱입니다. SwiftUI로 작성되었습니다.

## 구성

앱은 3개의 탭으로 이루어져 있습니다.

### 1. 통증 평가
인쇄된 채점표를 그대로 옮긴 4개 항목을 각각 0~10점으로 측정합니다. 점수를 조절하면 해당 점수의 채점 기준 설명이 실시간으로 표시되며, "채점 기준 보기"로 항목별 전체 기준을 확인할 수 있습니다.

1. **통증** — 통증의 정도
2. **우울감** — 증상의 정도
3. **해리, 이인** — 증상의 정도
4. **잠** — 증상의 정도

- 총점 = 네 항목 점수의 합 (**/40**)

### 2. 조증의 진단
DSM 기준 7개 문항에 대해 **예 / 아니요**로 응답합니다.

- 예 = 1점, 아니요 = 0점
- 총점 = 예로 응답한 문항 수 (**/7**)

### 3. 결과 분석
날짜/시간에 따른 두 점수(통증 평가 총점, 조증 진단 총점)의 변화를 확인합니다.

- **그래프**: 이중 축 선 그래프 (왼쪽 통증 /40, 오른쪽 조증 /7) — Swift Charts 사용
- **통합 표**: 시점별 두 점수를 한 표로 정리

## 데이터 저장

모든 기록은 기기의 `UserDefaults`에 저장되어 앱을 다시 켜도 유지됩니다. (기기 로컬 저장, 서버 전송 없음)

## 빌드 및 실행

1. macOS에서 Xcode 15 이상으로 `SymptomAssessment.xcodeproj`를 엽니다.
2. 실행 대상(시뮬레이터 또는 실제 iPhone)을 선택합니다.
3. `Cmd + R`로 빌드 후 실행합니다.

- 최소 지원 버전: iOS 16.0 (Swift Charts 사용)
- 언어: Swift 5 / SwiftUI

## 프로젝트 구조

```
SymptomAssessment/
├── SymptomAssessmentApp.swift   # 앱 진입점
├── ContentView.swift            # 3개 탭 구성
├── Models.swift                 # PainRecord, ManiaRecord, TimelinePoint
├── AssessmentStore.swift        # 저장/불러오기(UserDefaults), 타임라인 병합
├── PainRubric.swift             # 항목별 채점 기준(설명) 데이터
├── PainEvaluationView.swift     # 통증 평가 화면
├── ManiaDiagnosisView.swift     # 조증의 진단 화면
├── AnalysisView.swift           # 결과 분석(그래프 + 표) 화면
└── Assets.xcassets              # 앱 아이콘/색상
```
