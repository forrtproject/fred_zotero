# Zotero Replication Checker Locale File - Korean (한국어)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = 현재 라이브러리에서 복제 연구 확인
replication-checker-context-menu = 복제 연구 확인
replication-checker-context-menu-ban = 복제 연구 차단
replication-checker-context-menu-add-original = 원본 추가
replication-checker-context-menu-add-originals = 원본(들) 추가

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
replication-checker-progress-match-count =
    { $count ->
        [one] 복제 연구가 있는 항목 1개 발견
       *[other] 복제 연구가 있는 항목 { $count }개 발견
    }
replication-checker-progress-copying-readonly = 읽기 전용 라이브러리에서 개인 라이브러리로 항목 복사 중...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = 선택한 항목에서 DOI를 찾을 수 없습니다.
replication-checker-alert-no-collection = 이 확인을 실행하기 전에 컬렉션을 선택하세요.
replication-checker-alert-no-originals-available = 이 복제 연구에 사용 가능한 원본 연구가 없습니다.
replication-checker-alert-no-doi = 선택한 항목에 DOI가 없습니다.
replication-checker-add-original-success = "{ $title }"이(가) "{ $folderName }"에 성공적으로 추가되었습니다.
replication-checker-add-original-exists = "{ $title }"은(는) 이미 라이브러리에 있습니다 — "{ $folderName }"에서 태그, 메모 및 관계가 업데이트되었습니다.
replication-checker-add-original-add-all-btn = 모든 원본 추가
replication-checker-add-original-confirm =
    { $count ->
        [one] 이 복제 연구에 대해 원본 연구 1개를 찾았습니다. 라이브러리에 추가할 원본을 선택하세요.
       *[other] 이 복제 연구에 대해 { $count }개의 원본 연구를 찾았습니다. 라이브러리에 추가할 원본을 선택하세요.
    }
replication-checker-add-original-select-btn = 추가할 원본 선택
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] 1개 새로 추가, { $existingCount }개 기존 원본 연구가 "{ $folderName }"에서 업데이트되었습니다.
       *[other] { $newCount }개 새로 추가, { $existingCount }개 기존 원본 연구가 "{ $folderName }"에서 업데이트되었습니다.
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] 원본 연구 1개가 "{ $folderName }"에 성공적으로 추가되었습니다.
       *[other] { $count }개의 원본 연구가 "{ $folderName }"에 성공적으로 추가되었습니다.
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 원본 연구 1개가 이미 라이브러리에 있습니다 — "{ $folderName }"에서 태그, 메모 및 관계가 업데이트되었습니다.
       *[other] { $count }개의 원본 연구가 이미 라이브러리에 있습니다 — "{ $folderName }"에서 태그, 메모 및 관계가 업데이트되었습니다.
    }
replication-checker-error-title = Replication Checker - 오류
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
    { $count ->
        [one] 복제 연구 1개를 차단하시겠습니까?
       *[other] { $count }개의 복제 연구를 차단하시겠습니까?
    }

    이 항목들은 휴지통으로 이동되며 향후 확인 시 다시 추가되지 않습니다.
replication-checker-ban-success =
    { $count ->
        [one] 복제 연구 1개를 성공적으로 차단했습니다.
       *[other] { $count }개의 복제 연구를 성공적으로 차단했습니다.
    }
replication-checker-alert-no-replications-selected = 선택한 복제 연구 항목이 없습니다.

## Dialog
replication-checker-dialog-title = 복제 연구 발견
replication-checker-dialog-intro =
    다음에 대한 복제 연구 발견:
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] 복제 연구 1개 발견:
       *[other] { $count }개의 복제 연구 발견:
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       결과: { $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...그리고 복제 연구 1개 더
       *[other] ...그리고 { $count }개의 복제 연구 더
    }
replication-checker-dialog-question = 복제 연구 정보를 추가하시겠습니까?
replication-checker-dialog-progress-title = 복제 연구 정보 추가됨
replication-checker-dialog-progress-line = "{ $title }"에 복제 연구 정보 추가됨
replication-checker-notif-replication-new =
    { $count ->
        [one] 새 복제 연구 1개가 "{ $folderName }"에 성공적으로 추가되었습니다.
       *[other] { $count }개의 새 복제 연구가 "{ $folderName }"에 성공적으로 추가되었습니다.
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 복제 연구 1개가 이미 라이브러리에 있습니다 — "{ $folderName }"에서 태그, 메모 및 관계가 업데이트되었습니다.
       *[other] { $count }개의 복제 연구가 이미 라이브러리에 있습니다 — "{ $folderName }"에서 태그, 메모 및 관계가 업데이트되었습니다.
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] 1개 새로 추가, { $existingCount }개 기존 복제 연구가 "{ $folderName }"에서 업데이트되었습니다.
       *[other] { $newCount }개 새로 추가, { $existingCount }개 기존 복제 연구가 "{ $folderName }"에서 업데이트되었습니다.
    }
replication-checker-dialog-is-replication-title = 원본 연구 발견
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] 복제 연구를 찾지 못했지만, 이 논문은 복제 연구인 것으로 보입니다. 원본 논문 1개를 찾았습니다. 라이브러리에 추가하시겠습니까?
       *[other] 복제 연구를 찾지 못했지만, 이 논문은 복제 연구인 것으로 보입니다. { $count }개의 원본 논문을 찾았습니다. 라이브러리에 추가할 원본을 선택하세요.
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = 읽기 전용 라이브러리 감지됨
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] 이 라이브러리는 읽기 전용입니다. 복제 연구 1개가 있는 { $itemCount }개의 항목을 찾았습니다.
       *[other] 이 라이브러리는 읽기 전용입니다. { $replicationCount }개의 복제 연구가 있는 { $itemCount }개의 항목을 찾았습니다.
    }

    원본 논문과 복제 연구를 개인 라이브러리의 "복제 연구 폴더"에 복사하시겠습니까?

## Results Messages
replication-checker-results-title-library = 라이브러리 스캔 완료
replication-checker-results-title-selected = 선택한 항목 스캔 완료
replication-checker-results-title-collection = 컬렉션 스캔 완료
replication-checker-results-total = 확인한 총 항목 수: { $count }
replication-checker-results-dois = DOI가 있는 항목: { $count }
replication-checker-results-found =
    { $count ->
        [one] 1개의 항목에 복제 연구가 있으며 "{ $folderName }"에 저장되었습니다.
       *[other] { $count }개의 항목에 복제 연구가 있으며 "{ $folderName }"에 저장되었습니다.
    }
replication-checker-results-none = 복제 연구를 찾을 수 없습니다.
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1개의 항목에 재현 연구가 있으며 "{ $folderName }"에 저장되었습니다.
       *[other] { $count }개의 항목에 재현 연구가 있으며 "{ $folderName }"에 저장되었습니다.
    }
replication-checker-results-reproductions-none = 재현 연구를 찾을 수 없습니다.
replication-checker-results-footer = 세부 정보는 메모를 확인하거나 항목을 선택하여 다시 확인하세요.

## Tags
replication-checker-tag = 복제됨
replication-checker-tag-is-replication = 복제 연구임
replication-checker-tag-added-by-checker = Replication Checker에 의해 추가됨
replication-checker-tag-success = 복제 연구: 성공
replication-checker-tag-failure = 복제 연구: 실패
replication-checker-tag-mixed = 복제 연구: 혼합
replication-checker-tag-multiple-originals = 복제 연구: 여러 원본
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
replication-checker-note-footer = FORRT 문헌 데이터베이스(FLoRA)를 사용하는 Zotero Replication Checker에 의해 생성됨

## Replication Item Details
replication-checker-li-no-title = 제목 없음
replication-checker-li-no-authors = 저자 없음
replication-checker-li-no-journal = 학술지 없음
replication-checker-li-na = 해당 없음
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = 저자 보고 결과:
replication-checker-li-link = 이 연구에는 연결된 보고서가 있습니다:

## First Run Prompt
replication-checker-prompt-title = Zotero Replication Checker에 오신 것을 환영합니다!
replication-checker-prompt-first-run =
    Zotero Replication Checker를 설치해 주셔서 감사합니다!

    이 플러그인은 FORRT 문헌 데이터베이스(FLoRA)에 대해 라이브러리 항목을 확인하여 연구에 대한 복제 연구를 발견하는 데 도움을 줍니다.

    지금 라이브러리에서 복제 연구를 스캔하시겠습니까?

    • "확인"을 클릭하여 스캔 시작 (몇 분 소요될 수 있음)
    • "취소"를 클릭하여 건너뛰기 - 나중에 도구 메뉴에서 언제든지 스캔할 수 있습니다

## Onboarding
onboarding-welcome-title = Replication Checker에 오신 것을 환영합니다!
onboarding-welcome-content =
    Zotero Replication Checker를 설치해 주셔서 감사합니다!

    이 플러그인은 FORRT 문헌 데이터베이스(FLoRA)에 대해 라이브러리 항목을 자동으로 확인하여 복제 및 재현 연구를 발견하는 데 도움을 줍니다.

    ✨ 주요 기능:
    • 전체 라이브러리, 컬렉션 또는 개별 항목 확인
    • 복제 연구 및 컴퓨터 기반 재현 연구 모두 감지
    • 여러 원본 연구가 있는 논문 처리
    • 결과 태그가 달린 DOI 링크 메모 추가
    • 항목 자동 태그 지정 (예: '복제 연구 있음', '복제 연구임')
    • 복제 연구가 감지될 때 원본 연구 추가 제안
    • 읽기 전용 그룹 라이브러리 지원 — 개인 라이브러리에 항목 복사
    • 모든 컬렉션을 하나의 'FLoRA' 컬렉션 안에 보관하며 이름 설정 가능
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

    🗂️ 저장 위치:
    플러그인이 만드는 모든 항목은 하나의 'FLoRA' 컬렉션 안에 들어갑니다
    • FLoRA Replications, FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ 환경설정:
    편집 → 설정 → Replication Checker
    • 자동 확인 빈도
    • 새 항목 자동 확인
    • 'FLoRA' 컨테이너를 포함한 컬렉션 이름
    • 라이브러리별 FLoRA 통계 및 Replication Atlas 링크

onboarding-stats-title = 나의 FLoRA 통계
onboarding-stats-content =
    📍 위치: 편집 → 설정 → Replication Checker

    📊 FLoRA가 내 라이브러리에 대해 알고 있는 실시간 수치:
    • 복제 연구 / 재현 연구가 있는 논문
    • 그 자체가 복제 연구 또는 재현 연구인 논문
    • 고유 DOI 기준으로 집계되므로 같은 논문을 두 번 저장해도 한 번만 계산됩니다

    📚 그룹 라이브러리:
    그룹 라이브러리가 있으면 표 위에 라이브러리 선택기가 나타나며, 개인 라이브러리뿐 아니라 선택한 라이브러리의 통계가 표시됩니다.

    🌍 FLoRA Atlas에서 열기:
    선택한 라이브러리에서 추적 중인 DOI가 미리 입력된 Replication Atlas를 열어, 내 문헌이 복제 연구 문헌 전체에서 어디에 위치하는지 확인합니다.

    💡 사용 가능한 DOI가 없는 항목은 식별할 수 없어 제외되며, 버튼 아래 안내에 그 개수가 표시됩니다.

onboarding-scan-title = 라이브러리를 스캔할 준비가 되셨나요?
onboarding-scan-content =
    지금 라이브러리에서 복제 연구를 스캔하시겠습니까?

    • "예"를 클릭하여 스캔 시작
      (몇 분 소요될 수 있음)

    • "아니오"를 클릭하여 건너뛰기 - 나중에 도구 메뉴에서 언제든지 스캔할 수 있습니다

    💡 언제든지 이 가이드에 접근:
    도움말 → Replication Checker 사용자 가이드

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = 재현 연구 차단

## Reproduction Feature - Tags
reproduction-checker-tag = 재현됨
reproduction-checker-tag-is-reproduction = 재현 연구임
reproduction-checker-tag-added-by-checker = Replication Checker에 의해 추가됨
reproduction-checker-tag-readonly-origin = 원본이 읽기 전용 라이브러리에 있음

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = 재현 연구: 계산 성공, 견고
reproduction-checker-tag-outcome-cs-challenges = 재현 연구: 계산 성공, 견고성 문제
reproduction-checker-tag-outcome-cs-not-checked = 재현 연구: 계산 성공, 견고성 미확인
reproduction-checker-tag-outcome-ci-robust = 재현 연구: 계산 문제, 견고
reproduction-checker-tag-outcome-ci-challenges = 재현 연구: 계산 문제, 견고성 문제
reproduction-checker-tag-outcome-ci-not-checked = 재현 연구: 계산 문제, 견고성 미확인
reproduction-checker-tag-multiple-originals = 재현 연구: 여러 원본

## Reproduction Feature - Note Template
reproduction-checker-note-title = 재현 연구 발견
reproduction-checker-note-warning = 이 메모는 자동으로 생성됩니다. 편집하면 다음 확인 시 새 메모가 생성되고 이 버전은 그대로 유지됩니다.
reproduction-checker-note-intro = 이 연구는 재현되었습니다:
reproduction-checker-note-feedback = 이 결과가 유용하셨나요? <a href="{ $url }" target="_blank">여기</a>에서 피드백을 남겨주세요!
reproduction-checker-note-data-issues = 데이터에서 문제를 발견하셨나요? <a href="{ $url }" target="_blank">여기</a>에 신고해 주세요!
reproduction-checker-note-footer = FORRT 문헌 데이터베이스(FLoRA)를 사용하는 Zotero Replication Checker에 의해 생성됨

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
    { $count ->
        [one] 재현 연구 1개를 차단하시겠습니까?
       *[other] { $count }개의 재현 연구를 차단하시겠습니까?
    }

    이 항목들은 휴지통으로 이동되며 향후 확인 시 다시 추가되지 않습니다.
reproduction-checker-ban-success =
    { $count ->
        [one] 재현 연구 1개를 성공적으로 차단했습니다.
       *[other] { $count }개의 재현 연구를 성공적으로 차단했습니다.
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = 관련 연구 발견
replication-checker-dialog-intro-studies =
    다음 항목에 대한 연구를 찾았습니다:
    '{ $title }'
replication-checker-dialog-question-studies = 이 정보를 라이브러리에 추가하시겠습니까?
reproduction-checker-dialog-title = 재현 연구 발견
reproduction-checker-dialog-intro =
    다음에 대한 재현 연구 발견:
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] 재현 연구 1개 발견:
       *[other] { $count }개의 재현 연구 발견:
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       결과: { $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...그리고 재현 연구 1개 더
       *[other] ...그리고 { $count }개의 재현 연구 더
    }
reproduction-checker-dialog-question = 재현 연구 정보를 추가하시겠습니까?
reproduction-checker-dialog-progress-title = 재현 연구 정보 추가됨
reproduction-checker-dialog-progress-line = "{ $title }"에 재현 연구 정보 추가됨

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] 재현 연구가 있는 항목 1개 발견
       *[other] 재현 연구가 있는 항목 { $count }개 발견
    }

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
pref-folder-title = 복제 연구 폴더 이름
pref-folder-description = 복제 연구 항목이 저장되는 Zotero 컬렉션 이름
pref-folder-hint = 변경하면 기존 컬렉션 이름이 자동으로 변경됩니다. 모든 항목은 동일한 컬렉션에 남습니다.
pref-repro-folder-title = 재현 연구 폴더 이름
pref-repro-folder-description = 재현 연구 항목이 저장되는 Zotero 컬렉션 이름
pref-repro-folder-hint = 변경하면 기존 컬렉션 이름이 자동으로 변경됩니다. 모든 항목은 동일한 컬렉션에 남습니다.
pref-originals-replication-folder-title = 원본 폴더 (복제 연구와 연결됨)
pref-originals-replication-folder-description = 원본 논문(복제 연구가 추가된)이 저장되는 Zotero 컬렉션 이름
pref-originals-replication-folder-hint = 변경하면 기존 컬렉션 이름이 자동으로 변경됩니다. 모든 항목은 동일한 컬렉션에 남습니다.
pref-originals-reproduction-folder-title = 원본 폴더 (재현 연구와 연결됨)
pref-originals-reproduction-folder-description = 원본 논문(재현 연구가 추가된)이 저장되는 Zotero 컬렉션 이름
pref-originals-reproduction-folder-hint = 변경하면 기존 컬렉션 이름이 자동으로 변경됩니다. 모든 항목은 동일한 컬렉션에 남습니다.

## Stats Pane
pref-stats-title = FLoRA 통계
pref-stats-description = 현재 Zotero 라이브러리를 기반으로 한 통계
pref-stats-has-replication = 복제 연구가 있는 논문
pref-stats-has-reproduction = 재현 연구가 있는 논문
pref-stats-is-replication = 복제 연구로 식별된 논문
pref-stats-originals = 추적된 원본 논문
pref-stats-refresh = 통계 새로 고침
pref-stats-no-originals = 라이브러리에서 추적된 원본 논문을 찾을 수 없습니다. 먼저 복제 연구 확인을 실행하세요.
pref-stats-open-atlas = FLoRA Atlas에서 열기 ↗
pref-stats-view-flora = FLoRA 데이터베이스 보기 →

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
