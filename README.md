# 증상 평가 (Symptom Assessment)

통증 평가와 조증 진단을 기록하고, 두 점수의 변화를 표와 그래프로 분석하는 도구입니다. 동일한 기능을 **iPhone 앱(SwiftUI)** 과 **웹 앱** 두 가지로 제공합니다.

- `SymptomAssessment/`, `SymptomAssessment.xcodeproj` — iOS(iPhone) 앱
- `web/` — 웹 앱 (브라우저에서 바로 실행)

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

## 웹 앱 (web/)

iOS 앱과 동일한 채점 기준·문항·이중 축 그래프를 그대로 구현한 웹 버전입니다. 외부 라이브러리나 빌드 과정 없이 순수 HTML/CSS/JavaScript로 작성되어 있습니다.

### 실행
- **로컬**: `web/index.html`을 브라우저에서 그대로 열면 됩니다. (별도 서버 불필요)
- **온라인(GitHub Pages)**: 아래 배포 설정 후 `https://mrnoh99.github.io/PainEvaluation/` 에서 접속합니다.
- 기록은 브라우저의 `localStorage`에 저장됩니다.
- 라이트/다크 모드를 자동으로 따릅니다.

### GitHub Pages 배포

`.github/workflows/deploy-pages.yml` 워크플로가 `web/` 폴더를 GitHub Pages로 자동 배포합니다. 기본 브랜치에 푸시되면 실행됩니다.

**최초 1회 설정 (필수)** — GitHub Pages는 워크플로 토큰 권한으로 자동 활성화할 수 없어, 저장소 소유자가 아래를 한 번 켜 주어야 합니다.

1. GitHub 저장소 → **Settings → Pages**
2. **Build and deployment → Source** 를 **GitHub Actions** 로 선택
3. **Actions** 탭 → "Deploy web app to GitHub Pages" 워크플로를 다시 실행(Re-run) 하거나, 아무 커밋이나 푸시
4. 워크플로가 성공하면 표시된 URL(`https://mrnoh99.github.io/PainEvaluation/`)에서 접속

> 위 1~2번을 켜기 전까지는 워크플로가 "Create Pages site failed" 로 실패합니다. 이는 정상이며, Source를 GitHub Actions로 지정한 뒤 재실행하면 배포됩니다.

### 데이터 백업 (내보내기 / 가져오기)

기록은 브라우저에만 저장되므로 기기 교체·백업을 위해 파일로 주고받을 수 있습니다.

- **데이터 내보내기**: 모든 기록을 JSON 백업 파일(`증상평가-백업-YYYY-MM-DD-HH-mm.json`)로 저장
- **데이터 가져오기**: 백업 파일을 선택하면 현재 기록에 **병합**(같은 항목은 중복 없이 추가)

### PWA (오프라인 · 앱 설치)

웹앱이 PWA로 구성되어 있어 실제 앱처럼 설치하고 오프라인에서도 사용할 수 있습니다.

- **설치**: Android 크롬은 "앱 설치" 버튼 또는 메뉴 → "홈 화면에 추가", iOS Safari는 공유 → "홈 화면에 추가"
- **오프라인**: 서비스워커(`sw.js`)가 앱 셸을 캐시하므로 최초 접속 이후에는 네트워크 없이도 실행됩니다.

### 결과 분석 그래프 조작
- 기본적으로 한 화면에 **7개 데이터**가 보이도록 간격이 맞춰집니다.
- **두 손가락(핀치)** 으로 데이터 간격을 좁히거나 넓힐 수 있습니다.
- **좌우로 밀어서** 지나간 기록을 이동하며 볼 수 있습니다.
- 위 동작은 **그래프 영역 안에서만** 적용되며, 그래프 **밖에서 핀치하면** 평소처럼 **화면(페이지) 확대/축소**가 됩니다. (iOS Safari의 `gesture` 이벤트, Android의 `touch` 이벤트를 각각 처리)
- 데스크톱/보조 수단으로 **＋ / − / 기본** 버튼도 제공합니다.

### 구성
```
web/
├── index.html            # 3개 탭 화면 구조 + PWA 메타/매니페스트 링크
├── styles.css            # 스타일 (라이트/다크 테마)
├── app.js                # 채점 기준, 저장/불러오기, 이중 축 SVG 그래프,
│                         #   내보내기/가져오기, 서비스워커 등록
├── manifest.webmanifest  # PWA 매니페스트 (이름/색상/아이콘)
├── sw.js                 # 서비스워커 (오프라인 캐시)
├── .nojekyll
└── icons/                # PWA 아이콘 (192 / 512 / maskable)
```

두 버전 모두 채점 기준(`PainRubric.swift` ↔ `app.js`의 `PAIN_ITEMS`)과 조증 문항이 동일하게 유지됩니다.
