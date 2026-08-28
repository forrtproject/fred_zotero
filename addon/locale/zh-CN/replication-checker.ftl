# Zotero Replication Checker Locale File - Chinese Simplified (简体中文)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = 检查当前文献库的重复研究
replication-checker-context-menu = 检查重复研究
replication-checker-context-menu-ban = 屏蔽重复研究
replication-checker-context-menu-add-original = 添加原始文献
replication-checker-context-menu-add-originals = 添加原始文献（多篇）

## Progress Messages
replication-checker-progress-checking-library = 正在检查重复研究
replication-checker-progress-checking-collection = 正在检查分组中的重复研究
replication-checker-progress-scanning-library = 正在扫描文献库...
replication-checker-progress-scanning-collection = 正在扫描分组...
replication-checker-progress-found-dois = 找到 { $itemCount } 个含有 DOI 的条目（{ $uniqueCount } 个唯一）
replication-checker-progress-checking-database = 正在查询重复研究数据库...
replication-checker-progress-no-dois = 在分组中未找到含有 DOI 的条目
replication-checker-progress-complete = 检查完成
replication-checker-progress-failed = 检查失败
replication-checker-progress-match-count =
    { $count ->
        [one] 找到 1 个含有重复研究的条目
       *[other] 找到 { $count } 个含有重复研究的条目
    }
replication-checker-progress-copying-readonly = 正在将只读文献库中的条目复制到个人文献库...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = 所选条目中未找到 DOI。
replication-checker-alert-no-collection = 请在运行此检查前先选择一个分组。
replication-checker-alert-no-originals-available = 此重复研究没有可用的原始研究。
replication-checker-alert-no-doi = 所选条目没有 DOI。
replication-checker-add-original-success = 已成功将"{ $title }"添加到"{ $folderName }"。
replication-checker-add-original-exists = "{ $title }"已在您的文献库中——已更新"{ $folderName }"中的标签、笔记和关联。
replication-checker-add-original-add-all-btn = 添加所有原始文献
replication-checker-add-original-confirm =
    { $count ->
        [one] 为此重复研究找到 1 篇原始文献。请选择您希望添加到文献库的原始文献。
       *[other] 为此重复研究找到 { $count } 篇原始文献。请选择您希望添加到文献库的原始文献。
    }
replication-checker-add-original-select-btn = 选择要添加的原始文献
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] 已在"{ $folderName }"中新增 1 篇并更新 { $existingCount } 篇原始研究。
       *[other] 已在"{ $folderName }"中新增 { $newCount } 篇并更新 { $existingCount } 篇原始研究。
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] 已成功将 1 篇原始研究添加到"{ $folderName }"。
       *[other] 已成功将 { $count } 篇原始研究添加到"{ $folderName }"。
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 1 篇原始研究已在您的文献库中——已更新"{ $folderName }"中的标签、笔记和关联。
       *[other] { $count } 篇原始研究已在您的文献库中——已更新"{ $folderName }"中的标签、笔记和关联。
    }
replication-checker-error-title = Replication Checker - 错误
replication-checker-error-api = 无法从 API 获取数据 - 请检查您的网络连接或稍后重试。
replication-checker-error-body =
    检查 { $target } 的重复研究时失败：

    { $details }

    无法从 API 获取数据 - 请检查您的网络连接或稍后重试。
replication-checker-target-library = 当前文献库
replication-checker-target-selected = 所选条目
replication-checker-target-collection = 所选分组

## Ban Feature
replication-checker-ban-title = 屏蔽重复研究
replication-checker-ban-confirm =
    { $count ->
        [one] 确定要屏蔽 1 篇重复研究吗？
       *[other] 确定要屏蔽 { $count } 篇重复研究吗？
    }

    这些条目将被移至回收站，且不会在以后的检查中重新添加。
replication-checker-ban-success =
    { $count ->
        [one] 已成功屏蔽 1 篇重复研究。
       *[other] 已成功屏蔽 { $count } 篇重复研究。
    }
replication-checker-alert-no-replications-selected = 未选择任何重复研究条目。

## Dialog
replication-checker-dialog-title = 找到重复研究
replication-checker-dialog-intro =
    为以下文献找到重复研究：
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] 找到 1 篇重复研究：
       *[other] 找到 { $count } 篇重复研究：
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       结果：{ $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...以及另外 1 篇重复研究
       *[other] ...以及另外 { $count } 篇重复研究
    }
replication-checker-dialog-question = 是否添加重复研究信息？
replication-checker-dialog-progress-title = 已添加重复研究信息
replication-checker-dialog-progress-line = 已向"{ $title }"添加重复研究信息
replication-checker-notif-replication-new =
    { $count ->
        [one] 已成功将 1 篇新重复研究添加到"{ $folderName }"。
       *[other] 已成功将 { $count } 篇新重复研究添加到"{ $folderName }"。
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 1 篇重复研究已在您的文献库中——已更新"{ $folderName }"中的标签、笔记和关联。
       *[other] { $count } 篇重复研究已在您的文献库中——已更新"{ $folderName }"中的标签、笔记和关联。
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] 已在"{ $folderName }"中新增 1 篇并更新 { $existingCount } 篇重复研究。
       *[other] 已在"{ $folderName }"中新增 { $newCount } 篇并更新 { $existingCount } 篇重复研究。
    }
replication-checker-dialog-is-replication-title = 找到原始研究
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] 未找到重复研究，但这似乎是一篇重复研究论文。找到 1 篇原始文献。是否将其添加到您的文献库？
       *[other] 未找到重复研究，但这似乎是一篇重复研究论文。找到 { $count } 篇原始文献。请选择您希望添加到文献库的原始文献。
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = 检测到只读文献库
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] 此文献库为只读。我们找到 { $itemCount } 个条目，含有 1 篇重复研究。
       *[other] 此文献库为只读。我们找到 { $itemCount } 个条目，含有 { $replicationCount } 篇重复研究。
    }

    是否将原始文献及其重复研究复制到您个人文献库的"重复研究文件夹"？

## Results Messages
replication-checker-results-title-library = 文献库扫描完成
replication-checker-results-title-selected = 所选条目扫描完成
replication-checker-results-title-collection = 分组扫描完成
replication-checker-results-total = 已检查条目总数：{ $count }
replication-checker-results-dois = 含有 DOI 的条目：{ $count }
replication-checker-results-found =
    { $count ->
        [one] 1 个条目含有重复研究，已存储在"{ $folderName }"中。
       *[other] { $count } 个条目含有重复研究，已存储在"{ $folderName }"中。
    }
replication-checker-results-none = 未找到重复研究。
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1 个条目含有重复实验，已存储在"{ $folderName }"中。
       *[other] { $count } 个条目含有重复实验，已存储在"{ $folderName }"中。
    }
replication-checker-results-reproductions-none = 未找到重复实验。
replication-checker-results-footer = 查看笔记了解详情，或选择条目重新检查。

## Tags
replication-checker-tag = 已被重复
replication-checker-tag-is-replication = 是重复研究
replication-checker-tag-added-by-checker = 由 Replication Checker 添加
replication-checker-tag-success = 重复研究：成功
replication-checker-tag-failure = 重复研究：失败
replication-checker-tag-mixed = 重复研究：混合结果
replication-checker-tag-multiple-originals = 重复研究：多篇原始文献
replication-checker-tag-readonly-origin = 原始文献在只读文献库中
replication-checker-tag-has-been-replicated = 已被重复
replication-checker-tag-has-been-reproduced = 已被复现
replication-checker-tag-in-flora = 收录于 FLoRA

## Note Template
replication-checker-note-title = 找到重复研究
replication-checker-note-warning = 此笔记为自动生成。如果您对其进行编辑，下次检查时将创建新笔记，本版本将保持原样。
replication-checker-note-intro = 本研究已被重复验证：
replication-checker-note-feedback = 您觉得此结果有用吗？请在<a href="{ $url }" target="_blank">此处</a>提供反馈！
replication-checker-note-data-issues = 您发现数据中有任何问题吗？请在<a href="{ $url }" target="_blank">此处</a>反馈！
replication-checker-note-footer = 由 Zotero Replication Checker 使用 FORRT 文献数据库（FLoRA）生成

## Replication Item Details
replication-checker-li-no-title = 无可用标题
replication-checker-li-no-authors = 无可用作者
replication-checker-li-no-journal = 无期刊信息
replication-checker-li-na = 不适用
replication-checker-li-doi-label = DOI：
replication-checker-li-outcome = 作者报告的结果：
replication-checker-li-link = 本研究有关联报告：

## First Run Prompt
replication-checker-prompt-title = 欢迎使用 Zotero Replication Checker！
replication-checker-prompt-first-run =
    感谢安装 Zotero Replication Checker！

    此插件通过对照 FORRT 文献数据库（FLoRA）检查您的文献库条目，帮助您发现相关的重复研究。

    是否现在扫描您的文献库以查找重复研究？

    • 单击"确定"开始扫描（这可能需要几分钟）
    • 单击"取消"跳过 - 您随时可以从"工具"菜单进行扫描

## Onboarding
onboarding-welcome-title = 欢迎使用 Replication Checker！
onboarding-welcome-content =
    感谢安装 Zotero Replication Checker！

    此插件通过自动对照 FORRT 文献数据库（FLoRA）检查您的文献库条目，帮助您发现重复研究与再现研究。

    ✨ 主要功能：
    • 检查整个文献库、分组或单个条目
    • 同时检测重复研究和计算再现研究
    • 处理有多篇原始研究的文章
    • 添加带有结果标签和 DOI 链接的笔记
    • 自动为条目添加标签（如"有重复研究"、"是重复研究"）
    • 检测到重复研究时提供添加原始研究的选项
    • 支持只读群组文献库——将条目复制到个人文献库
    • 所有集合均置于单个“FLoRA”集合内，名称可配置
    • 屏蔽不需要的重复研究，使其不再出现

    让我们快速浏览以便您快速上手！

onboarding-tools-title = 检查整个文献库
onboarding-tools-content =
    📍 位置：工具 → 检查当前文献库的重复研究

    🔍 功能说明：
    • 扫描所有含有 DOI 的条目
    • 查询 FLoRA 数据库
    • 创建包含详细信息的笔记
    • 按结果为条目添加标签

    💡 提示：根据文献库大小，可能需要几分钟。

onboarding-context-title = 检查分组和条目
onboarding-context-content =
    📚 对于分组：
    右键单击分组 → 检查重复研究

    📄 对于单个条目：
    右键单击条目 → 检查重复研究

    🚫 屏蔽重复研究：
    右键单击重复研究条目 → 屏蔽重复研究
    • 防止不需要的重复研究被重新添加

    🗂️ 内容存放位置：
    插件创建的所有内容都位于单个“FLoRA”集合内
    • FLoRA Replications、FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ 首选项：
    编辑 → 设置 → Replication Checker
    • 自动检查频率
    • 自动检查新条目
    • 集合名称，包括“FLoRA”容器
    • 各文献库的 FLoRA 统计，并附 Replication Atlas 链接

onboarding-stats-title = 您的 FLoRA 统计
onboarding-stats-content =
    📍 位置：编辑 → 设置 → Replication Checker

    📊 FLoRA 对您文献库的实时统计：
    • 拥有重复研究／再现研究的文章
    • 本身即为重复研究或再现研究的文章
    • 按唯一 DOI 计数，同一篇论文保存两次仅计一次

    📚 群组文献库：
    如果您加入了群组文献库，表格上方会出现文献库选择器——统计数据对应所选的文献库，而不仅是个人文献库。

    🌍 在 FLoRA Atlas 中打开：
    打开 Replication Atlas 并预先载入所选文献库中已跟踪的 DOI，以了解您的阅读在整个重复研究文献中的位置。

    💡 没有可用 DOI 的条目无法识别，因此不计入其中——按钮下方的提示会说明数量。

onboarding-scan-title = 准备好扫描您的文献库了吗？
onboarding-scan-content =
    是否现在扫描您的文献库以查找重复研究？

    • 单击"是"开始扫描
      （这可能需要几分钟）

    • 单击"否"跳过 - 您随时可以从"工具"菜单进行扫描

    💡 随时访问此指南：
    帮助 → Replication Checker 用户指南

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = 屏蔽重复实验

## Reproduction Feature - Tags
reproduction-checker-tag = 已被复现
reproduction-checker-tag-is-reproduction = 是重复实验
reproduction-checker-tag-added-by-checker = 由 Replication Checker 添加
reproduction-checker-tag-readonly-origin = 原始文献在只读文献库中

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = 重复实验：计算成功，结果稳健
reproduction-checker-tag-outcome-cs-challenges = 重复实验：计算成功，稳健性存在挑战
reproduction-checker-tag-outcome-cs-not-checked = 重复实验：计算成功，稳健性未检查
reproduction-checker-tag-outcome-ci-robust = 重复实验：存在计算问题，结果稳健
reproduction-checker-tag-outcome-ci-challenges = 重复实验：存在计算问题，稳健性存在挑战
reproduction-checker-tag-outcome-ci-not-checked = 重复实验：存在计算问题，稳健性未检查
reproduction-checker-tag-multiple-originals = 重复实验：多篇原始文献

## Reproduction Feature - Note Template
reproduction-checker-note-title = 找到重复实验
reproduction-checker-note-warning = 此笔记为自动生成。如果您对其进行编辑，下次检查时将创建新笔记，本版本将保持原样。
reproduction-checker-note-intro = 本研究已被重复验证（复现）：
reproduction-checker-note-feedback = 您觉得此结果有用吗？请在<a href="{ $url }" target="_blank">此处</a>提供反馈！
reproduction-checker-note-data-issues = 您发现数据中有任何问题吗？请在<a href="{ $url }" target="_blank">此处</a>反馈！
reproduction-checker-note-footer = 由 Zotero Replication Checker 使用 FORRT 文献数据库（FLoRA）生成

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = 无可用标题
reproduction-checker-li-no-authors = 无可用作者
reproduction-checker-li-no-journal = 无期刊信息
reproduction-checker-li-na = 不适用
reproduction-checker-li-doi-label = DOI：
reproduction-checker-li-outcome = 重复实验结果：
reproduction-checker-li-link = 本研究有关联报告：

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = 未选择任何重复实验条目。
reproduction-checker-ban-title = 屏蔽重复实验
reproduction-checker-ban-confirm =
    { $count ->
        [one] 确定要屏蔽 1 篇重复实验吗？
       *[other] 确定要屏蔽 { $count } 篇重复实验吗？
    }

    这些条目将被移至回收站，且不会在以后的检查中重新添加。
reproduction-checker-ban-success =
    { $count ->
        [one] 已成功屏蔽 1 篇重复实验。
       *[other] 已成功屏蔽 { $count } 篇重复实验。
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = 发现相关研究
replication-checker-dialog-intro-studies =
    为以下条目找到研究：
    “{ $title }”
replication-checker-dialog-question-studies = 是否要将这些信息添加到您的文献库？
reproduction-checker-dialog-title = 找到重复实验
reproduction-checker-dialog-intro =
    为以下文献找到重复实验：
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] 找到 1 篇重复实验：
       *[other] 找到 { $count } 篇重复实验：
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       结果：{ $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...以及另外 1 篇重复实验
       *[other] ...以及另外 { $count } 篇重复实验
    }
reproduction-checker-dialog-question = 是否添加重复实验信息？
reproduction-checker-dialog-progress-title = 已添加重复实验信息
reproduction-checker-dialog-progress-line = 已向"{ $title }"添加重复实验信息

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] 找到 1 个含有重复实验的条目
       *[other] 找到 { $count } 个含有重复实验的条目
    }

## Preference Pane
pref-autocheck-title = 自动检查文献库的重复研究
pref-autocheck-description = 定期自动检查您的文献库以发现重复研究
pref-autocheck-disabled = 已禁用（仅手动检查）
pref-autocheck-daily = 每日（每 24 小时检查一次）
pref-autocheck-weekly = 每周（每 7 天检查一次）
pref-autocheck-monthly = 每月（每 30 天检查一次）
pref-autocheck-new-items = 自动检查新添加到文献库的条目（推荐）
pref-autocheck-new-items-hint = 如果您希望手动运行所有重复研究检查，请禁用此选项。
pref-autocheck-note = 当 Zotero 打开时，自动检查在后台运行。您仍然可以通过"工具"菜单手动检查。
pref-folder-title = 重复研究文件夹名称
pref-folder-description = 存储重复研究条目的 Zotero 分组名称
pref-folder-hint = 更改此项将自动重命名现有分组。所有条目将保留在同一分组中。
pref-repro-folder-title = 再现研究文件夹名称
pref-repro-folder-description = 存储再现研究条目的 Zotero 分组名称
pref-repro-folder-hint = 更改此项将自动重命名现有分组。所有条目将保留在同一分组中。
pref-originals-replication-folder-title = 原始文献文件夹（关联至重复研究）
pref-originals-replication-folder-description = 存储原始文献（其重复研究已被添加）的 Zotero 分组名称
pref-originals-replication-folder-hint = 更改此项将自动重命名现有分组。所有条目将保留在同一分组中。
pref-originals-reproduction-folder-title = 原始文献文件夹（关联至再现研究）
pref-originals-reproduction-folder-description = 存储原始文献（其再现研究已被添加）的 Zotero 分组名称
pref-originals-reproduction-folder-hint = 更改此项将自动重命名现有分组。所有条目将保留在同一分组中。

## Stats Pane
pref-stats-title = 您的 FLoRA 统计数据
pref-stats-description = 基于您当前 Zotero 文献库的统计数据
pref-stats-has-replication = 有重复研究的文章
pref-stats-has-reproduction = 有再现研究的文章
pref-stats-is-replication = 被标识为重复研究的文章
pref-stats-originals = 已追踪的原始文章
pref-stats-refresh = 刷新统计数据
pref-stats-no-originals = 在您的文献库中未找到已追踪的原始文章。请先运行重复研究检查。
pref-stats-open-atlas = 在 FLoRA Atlas 中打开 ↗
pref-stats-view-flora = 查看 FLoRA 数据库 →

pref-blacklist-title = 已屏蔽的重复研究
pref-blacklist-description = 管理您已屏蔽不在文献库中显示的重复研究
pref-blacklist-col-replication = 重复研究论文
pref-blacklist-col-original = 原始论文
pref-blacklist-col-type = 类型
pref-blacklist-col-banned = 屏蔽日期
pref-blacklist-empty = 没有已屏蔽的重复研究
pref-blacklist-remove = 移除所选
pref-blacklist-clear = 清除所有已屏蔽的重复研究
pref-blacklist-hint = 已屏蔽的重复研究不会在以后的检查中重新添加。您可以使用右键菜单屏蔽重复研究。
