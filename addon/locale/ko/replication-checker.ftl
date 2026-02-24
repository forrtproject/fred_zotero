# Zotero Replication Checker Locale File - Korean (한국어)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = 현재 라이브러리에서 복제 연구 확인
replication-checker-context-menu = 복제 연구 확인
replication-checker-context-menu-ban = 복제 연구 차단
replication-checker-context-menu-add-original = 원본 추가

## Progress Messages
replication-checker-progress-checking-library = 복제 연구 확인 중
replication-checker-progress-checking-collection = 컬렉션에서 복제 연구 확인 중
replication-checker-progress-scanning-library = 라이브러리 스캔 중...
replication-checker-progress-scanning-collection = 컬렉션 스캔 중...
replication-checker-progress-found-dois = DOI가 있는 항목 { $itemCount }개 발견 (고유 { $uniqueCount }개)
replication-checker-progress-checking-database = 복제 연구 데이터베이스 조회 중...
replication-checker-progress-no-dois = 컬렉션에서 DOI가 있는 항목을 찾을 수 없음
replication-checker-progress-complete = 확인 완료
replication-checker-progress-failed = 확인 실패
replication-checker-progress-match-count = 복제 연구가 있는 항목 { $count }개 발견
replication-checker-progress-copying-readonly = 읽기 전용 라이브러리에서 개인 라이브러리로 항목 복사 중...

## Alerts
replication-checker-alert-title = Zotero 복제 연구 확인기
replication-checker-alert-no-dois-selected = 선택한 항목에서 DOI를 찾을 수 없습니다.
replication-checker-alert-no-collection = 이 확인을 실행하기 전에 컬렉션을 선택하세요.
replication-checker-alert-no-originals-available = 이 복제 연구에 사용 가능한 원본 연구가 없습니다.
replication-checker-alert-no-doi = 선택한 항목에 DOI가 없습니다.
replication-checker-add-original-success = 원본 연구가 성공적으로 추가되었습니다: { $title }
replication-checker-add-original-confirm = 이 복제 연구에 대해 { $count }개의 원본 연구를 찾았습니다. 모두 라이브러리에 추가하시겠습니까?
replication-checker-add-original-batch-success = { $count }개의 원본 연구를 라이브러리에 성공적으로 추가했습니다.
replication-checker-error-title = 복제 연구 확인기 - 오류
replication-checker-error-api = API에서 데이터를 가져올 수 없습니다 - 인터넷 연결을 확인하거나 나중에 다시 시도하세요.
replication-checker-error-body =
    { $target }의 복제 연구 확인 실패:

    { $details }

    API에서 데이터를 가져올 수 없습니다 - 인터넷 연결을 확인하거나 나중에 다시 시도하세요.
replication-checker-target-library = 현재 라이브러리
replication-checker-target-selected = 선택한 항목
replication-checker-target-collection = 선택한 컬렉션

## Ban Feature
replication-checker-ban-title = 복제 연구 차단
replication-checker-ban-confirm =
    { $count }개의 복제 연구를 차단하시겠습니까?

    이 항목들은 휴지통으로 이동되며 향후 확인 시 다시 추가되지 않습니다.
replication-checker-ban-success = { $count }개의 복제 연구를 성공적으로 차단했습니다.
replication-checker-alert-no-replications-selected = 선택한 복제 연구 항목이 없습니다.

## Dialog
replication-checker-dialog-title = 복제 연구 발견
replication-checker-dialog-intro = 다음에 대한 복제 연구 발견:\n"{ $title }"
replication-checker-dialog-count = { $count }개의 복제 연구 발견:
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   결과: { $outcome }
replication-checker-dialog-more = ...그리고 { $count }개의 복제 연구 더
replication-checker-dialog-question = 복제 연구 정보를 추가하시겠습니까?
replication-checker-dialog-progress-title = 복제 연구 정보 추가됨
replication-checker-dialog-progress-line = "{ $title }"에 복제 연구 정보 추가됨
replication-checker-dialog-is-replication-title = 원본 연구 발견
replication-checker-dialog-is-replication-message = 복제 연구를 찾지 못했지만, 이 논문은 복제 연구인 것으로 보입니다.\n\n원본 논문을 추가하시겠습니까?

## Read-Only Library Handling
replication-checker-readonly-dialog-title = 읽기 전용 라이브러리 감지됨
replication-checker-readonly-dialog-message =
    이 라이브러리는 읽기 전용입니다. { $replicationCount }개의 복제 연구가 있는 { $itemCount }개의 항목을 찾았습니다.

    원본 논문과 복제 연구를 개인 라이브러리의 "복제 연구 폴더"에 복사하시겠습니까?

## Results Messages
replication-checker-results-title-library = 라이브러리 스캔 완료
replication-checker-results-title-selected = 선택한 항목 스캔 완료
replication-checker-results-title-collection = 컬렉션 스캔 완료
replication-checker-results-total = 확인한 총 항목 수: { $count }
replication-checker-results-dois = DOI가 있는 항목: { $count }
replication-checker-results-found = { $count }개의 항목에 복제 연구가 있습니다.
replication-checker-results-none = 복제 연구를 찾을 수 없습니다.
replication-checker-results-reproductions-found = { $count }개의 항목에 재현 연구가 있습니다.
replication-checker-results-reproductions-none = 재현 연구를 찾을 수 없습니다.
replication-checker-results-footer = 세부 정보는 메모를 확인하거나 항목을 선택하여 다시 확인하세요.

## Tags
replication-checker-tag = 복제 연구 있음
replication-checker-tag-is-replication = 복제 연구임
replication-checker-tag-added-by-checker = 복제 연구 확인기에 의해 추가됨
replication-checker-tag-success = 복제 연구: 성공
replication-checker-tag-failure = 복제 연구: 실패
replication-checker-tag-mixed = 복제 연구: 혼합
replication-checker-tag-readonly-origin = 원본이 읽기 전용 라이브러리에 있음
replication-checker-tag-has-been-replicated = 복제됨
replication-checker-tag-has-been-reproduced = 재현됨
replication-checker-tag-in-flora = FLoRA에 수록됨

## Note Template
replication-checker-note-title = 복제 연구 발견
replication-checker-note-warning = 이 메모는 자동으로 생성됩니다. 편집하면 다음 확인 시 새 메모가 생성되고 이 버전은 그대로 유지됩니다.
replication-checker-note-intro = 이 연구는 복제되었습니다:
replication-checker-note-feedback = 이 결과가 유용하셨나요? <a href="{ $url }" target="_blank">여기</a>에서 피드백을 남겨주세요!
replication-checker-note-data-issues = 데이터에서 문제를 발견하셨나요? <a href="{ $url }" target="_blank">여기</a>에 신고해 주세요!
replication-checker-note-footer = FORRT 문헌 데이터베이스(FLoRA)를 사용하는 Zotero 복제 연구 확인기에 의해 생성됨

## Replication Item Details
replication-checker-li-no-title = 제목 없음
replication-checker-li-no-authors = 저자 없음
replication-checker-li-no-journal = 학술지 없음
replication-checker-li-na = 해당 없음
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = 저자 보고 결과:
replication-checker-li-link = 이 연구에는 연결된 보고서가 있습니다:

## First Run Prompt
replication-checker-prompt-title = Zotero 복제 연구 확인기에 오신 것을 환영합니다!
replication-checker-prompt-first-run =
    Zotero 복제 연구 확인기를 설치해 주셔서 감사합니다!

    이 플러그인은 FORRT 문헌 데이터베이스(FLoRA)에 대해 라이브러리 항목을 확인하여 연구에 대한 복제 연구를 발견하는 데 도움을 줍니다.

    지금 라이브러리에서 복제 연구를 스캔하시겠습니까?

    • "확인"을 클릭하여 스캔 시작 (몇 분 소요될 수 있음)
    • "취소"를 클릭하여 건너뛰기 - 나중에 도구 메뉴에서 언제든지 스캔할 수 있습니다

## Onboarding
onboarding-welcome-title = 복제 연구 확인기에 오신 것을 환영합니다!
onboarding-welcome-content =
    Zotero 복제 연구 확인기를 설치해 주셔서 감사합니다!

    이 플러그인은 FORRT 문헌 데이터베이스(FLoRA)에 대해 라이브러리 항목을 자동으로 확인하여 복제 연구를 발견하는 데 도움을 줍니다.

    ✨ 주요 기능:
    • 복제 연구 데이터베이스에 대한 DOI 자동 확인
    • 전체 라이브러리, 컬렉션 또는 개별 항목 지원
    • 복제 연구 정보가 포함된 연결된 메모 생성
    • 복제 연구 상태로 항목 태그 지정
    • 복제 연구가 있을 때 원본 연구 추가
    • 향후 확인에서 원하지 않는 복제 연구 차단

    시작하기 위해 빠른 투어를 해봅시다!

onboarding-tools-title = 전체 라이브러리 확인
onboarding-tools-content =
    📍 위치: 도구 → 현재 라이브러리에서 복제 연구 확인

    🔍 기능:
    • DOI가 있는 모든 항목 스캔
    • FLoRA 데이터베이스 조회
    • 세부 정보가 포함된 메모 생성
    • 결과에 따라 항목 태그 지정

    💡 팁: 라이브러리 크기에 따라 몇 분 소요될 수 있습니다.

onboarding-context-title = 컬렉션 및 항목 확인
onboarding-context-content =
    📚 컬렉션의 경우:
    컬렉션 우클릭 → 복제 연구 확인

    📄 개별 항목의 경우:
    항목 우클릭 → 복제 연구 확인

    🚫 복제 연구 차단:
    복제 연구 항목 우클릭 → 복제 연구 차단
    • 원하지 않는 복제 연구가 다시 추가되는 것을 방지

    ⚙️ 환경설정:
    편집 → 설정 → 복제 연구 확인기
    • 자동 확인 빈도
    • 새 항목 자동 확인

onboarding-scan-title = 라이브러리를 스캔할 준비가 되셨나요?
onboarding-scan-content =
    지금 라이브러리에서 복제 연구를 스캔하시겠습니까?

    • "예"를 클릭하여 스캔 시작
      (몇 분 소요될 수 있음)

    • "아니오"를 클릭하여 건너뛰기 - 나중에 도구 메뉴에서 언제든지 스캔할 수 있습니다

    💡 언제든지 이 가이드에 접근:
    도움말 → 복제 연구 확인기 사용자 가이드

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = 재현 연구 차단

## Reproduction Feature - Tags
reproduction-checker-tag = 재현 연구 있음
reproduction-checker-tag-is-reproduction = 재현 연구임
reproduction-checker-tag-added-by-checker = 복제 연구 확인기에 의해 추가됨
reproduction-checker-tag-readonly-origin = 원본이 읽기 전용 라이브러리에 있음

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = 재현 연구: 계산 성공, 견고
reproduction-checker-tag-outcome-cs-challenges = 재현 연구: 계산 성공, 견고성 문제
reproduction-checker-tag-outcome-cs-not-checked = 재현 연구: 계산 성공, 견고성 미확인
reproduction-checker-tag-outcome-ci-robust = 재현 연구: 계산 문제, 견고
reproduction-checker-tag-outcome-ci-challenges = 재현 연구: 계산 문제, 견고성 문제
reproduction-checker-tag-outcome-ci-not-checked = 재현 연구: 계산 문제, 견고성 미확인

## Reproduction Feature - Note Template
reproduction-checker-note-title = 재현 연구 발견
reproduction-checker-note-warning = 이 메모는 자동으로 생성됩니다. 편집하면 다음 확인 시 새 메모가 생성되고 이 버전은 그대로 유지됩니다.
reproduction-checker-note-intro = 이 연구는 재현되었습니다:
reproduction-checker-note-feedback = 이 결과가 유용하셨나요? <a href="{ $url }" target="_blank">여기</a>에서 피드백을 남겨주세요!
reproduction-checker-note-data-issues = 데이터에서 문제를 발견하셨나요? <a href="{ $url }" target="_blank">여기</a>에 신고해 주세요!
reproduction-checker-note-footer = FORRT 문헌 데이터베이스(FLoRA)를 사용하는 Zotero 복제 연구 확인기에 의해 생성됨

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = 제목 없음
reproduction-checker-li-no-authors = 저자 없음
reproduction-checker-li-no-journal = 학술지 없음
reproduction-checker-li-na = 해당 없음
reproduction-checker-li-doi-label = DOI:
reproduction-checker-li-outcome = 재현 연구 결과:
reproduction-checker-li-link = 이 연구에는 연결된 보고서가 있습니다:

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = 선택한 재현 연구 항목이 없습니다.
reproduction-checker-ban-title = 재현 연구 차단
reproduction-checker-ban-confirm =
    { $count }개의 재현 연구를 차단하시겠습니까?

    이 항목들은 휴지통으로 이동되며 향후 확인 시 다시 추가되지 않습니다.
reproduction-checker-ban-success = { $count }개의 재현 연구를 성공적으로 차단했습니다.

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = 재현 연구 발견
reproduction-checker-dialog-intro = 다음에 대한 재현 연구 발견:\n"{ $title }"
reproduction-checker-dialog-count = { $count }개의 재현 연구 발견:
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   결과: { $outcome }
reproduction-checker-dialog-more = ...그리고 { $count }개의 재현 연구 더
reproduction-checker-dialog-question = 재현 연구 정보를 추가하시겠습니까?
reproduction-checker-dialog-progress-title = 재현 연구 정보 추가됨
reproduction-checker-dialog-progress-line = "{ $title }"에 재현 연구 정보 추가됨

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = 재현 연구가 있는 항목 { $count }개 발견

## Preference Pane
pref-autocheck-title = 복제 연구를 위한 라이브러리 자동 확인
pref-autocheck-description = 정기적으로 라이브러리에서 복제 연구를 자동으로 확인
pref-autocheck-disabled = 비활성화됨 (수동 확인만)
pref-autocheck-daily = 매일 (24시간마다 확인)
pref-autocheck-weekly = 매주 (7일마다 확인)
pref-autocheck-monthly = 매월 (30일마다 확인)
pref-autocheck-new-items = 새로 추가된 라이브러리 항목 자동 확인 (권장)
pref-autocheck-new-items-hint = 모든 복제 연구 확인을 수동으로 실행하려면 이 옵션을 비활성화하세요.
pref-autocheck-note = 자동 확인은 Zotero가 열려 있을 때 백그라운드에서 실행됩니다. 도구 메뉴를 사용하여 수동으로 확인할 수도 있습니다.
pref-blacklist-title = 차단된 복제 연구
pref-blacklist-description = 라이브러리에 표시되지 않도록 차단한 복제 연구 관리
pref-blacklist-col-replication = 복제 연구 논문
pref-blacklist-col-original = 원본 논문
pref-blacklist-col-type = 유형
pref-blacklist-col-banned = 차단 날짜
pref-blacklist-empty = 차단된 복제 연구 없음
pref-blacklist-remove = 선택 항목 제거
pref-blacklist-clear = 모든 차단된 복제 연구 지우기
pref-blacklist-hint = 차단된 복제 연구는 향후 확인 시 다시 추가되지 않습니다. 컨텍스트 메뉴를 사용하여 복제 연구를 차단할 수 있습니다.
