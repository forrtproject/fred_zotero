# Zotero Replication Checker Locale File - Chinese Simplified (简体中文)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = 检查当前文献库的重复研究
replication-checker-context-menu = 检查重复研究
replication-checker-context-menu-ban = 屏蔽重复研究
replication-checker-context-menu-add-original = 添加原始文献

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
replication-checker-progress-match-count = 找到 { $count } 个含有重复研究的条目
replication-checker-progress-copying-readonly = 正在将只读文献库中的条目复制到个人文献库...

## Alerts
replication-checker-alert-title = Zotero 重复研究检查器
replication-checker-alert-no-dois-selected = 所选条目中未找到 DOI。
replication-checker-alert-no-collection = 请在运行此检查前先选择一个分组。
replication-checker-alert-no-originals-available = 此重复研究没有可用的原始研究。
replication-checker-alert-no-doi = 所选条目没有 DOI。
replication-checker-add-original-success = 已成功添加原始研究：{ $title }
replication-checker-add-original-confirm = 为此重复研究找到 { $count } 篇原始研究。是否将它们全部添加到您的文献库？
replication-checker-add-original-batch-success = 已成功将 { $count } 篇原始研究添加到您的文献库。
replication-checker-error-title = 重复研究检查器 - 错误
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
    确定要屏蔽 { $count } 篇重复研究吗？

    这些条目将被移至回收站，且不会在以后的检查中重新添加。
replication-checker-ban-success = 已成功屏蔽 { $count } 篇重复研究。
replication-checker-alert-no-replications-selected = 未选择任何重复研究条目。

## Dialog
replication-checker-dialog-title = 找到重复研究
replication-checker-dialog-intro = 为以下文献找到重复研究：\n"{ $title }"
replication-checker-dialog-count = 找到 { $count } 篇重复研究：
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   结果：{ $outcome }
replication-checker-dialog-more = ...以及另外 { $count } 篇重复研究
replication-checker-dialog-question = 是否添加重复研究信息？
replication-checker-dialog-progress-title = 已添加重复研究信息
replication-checker-dialog-progress-line = 已向"{ $title }"添加重复研究信息
replication-checker-dialog-is-replication-title = 找到原始研究
replication-checker-dialog-is-replication-message = 未找到重复研究，但这似乎是一篇重复研究论文。\n\n是否添加原始文献？

## Read-Only Library Handling
replication-checker-readonly-dialog-title = 检测到只读文献库
replication-checker-readonly-dialog-message =
    此文献库为只读。我们找到 { $itemCount } 个条目，含有 { $replicationCount } 篇重复研究。

    是否将原始文献及其重复研究复制到您个人文献库的"重复研究文件夹"？

## Results Messages
replication-checker-results-title-library = 文献库扫描完成
replication-checker-results-title-selected = 所选条目扫描完成
replication-checker-results-title-collection = 分组扫描完成
replication-checker-results-total = 已检查条目总数：{ $count }
replication-checker-results-dois = 含有 DOI 的条目：{ $count }
replication-checker-results-found = { $count } 个条目含有重复研究。
replication-checker-results-none = 未找到重复研究。
replication-checker-results-reproductions-found = { $count } 个条目含有重复实验。
replication-checker-results-reproductions-none = 未找到重复实验。
replication-checker-results-footer = 查看笔记了解详情，或选择条目重新检查。

## Tags
replication-checker-tag = 有重复研究
replication-checker-tag-is-replication = 是重复研究
replication-checker-tag-added-by-checker = 由重复研究检查器添加
replication-checker-tag-success = 重复研究：成功
replication-checker-tag-failure = 重复研究：失败
replication-checker-tag-mixed = 重复研究：混合结果
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
replication-checker-note-footer = 由 Zotero 重复研究检查器使用 FORRT 文献数据库（FLoRA）生成

## Replication Item Details
replication-checker-li-no-title = 无可用标题
replication-checker-li-no-authors = 无可用作者
replication-checker-li-no-journal = 无期刊信息
replication-checker-li-na = 不适用
replication-checker-li-doi-label = DOI：
replication-checker-li-outcome = 作者报告的结果：
replication-checker-li-link = 本研究有关联报告：

## First Run Prompt
replication-checker-prompt-title = 欢迎使用 Zotero 重复研究检查器！
replication-checker-prompt-first-run =
    感谢安装 Zotero 重复研究检查器！

    此插件通过对照 FORRT 文献数据库（FLoRA）检查您的文献库条目，帮助您发现相关的重复研究。

    是否现在扫描您的文献库以查找重复研究？

    • 单击"确定"开始扫描（这可能需要几分钟）
    • 单击"取消"跳过 - 您随时可以从"工具"菜单进行扫描

## Onboarding
onboarding-welcome-title = 欢迎使用重复研究检查器！
onboarding-welcome-content =
    感谢安装 Zotero 重复研究检查器！

    此插件通过自动对照 FORRT 文献数据库（FLoRA）检查您的文献库条目，帮助您发现重复研究。

    ✨ 主要功能：
    • 自动对照重复研究数据库检查 DOI
    • 支持整个文献库、分组或单个条目
    • 创建带有重复研究信息的关联笔记
    • 为条目添加重复研究状态标签
    • 当存在重复研究时可添加原始研究
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

    ⚙️ 首选项：
    编辑 → 设置 → 重复研究检查器
    • 自动检查频率
    • 自动检查新条目

onboarding-scan-title = 准备好扫描您的文献库了吗？
onboarding-scan-content =
    是否现在扫描您的文献库以查找重复研究？

    • 单击"是"开始扫描
      （这可能需要几分钟）

    • 单击"否"跳过 - 您随时可以从"工具"菜单进行扫描

    💡 随时访问此指南：
    帮助 → 重复研究检查器用户指南

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = 屏蔽重复实验

## Reproduction Feature - Tags
reproduction-checker-tag = 有重复实验
reproduction-checker-tag-is-reproduction = 是重复实验
reproduction-checker-tag-added-by-checker = 由重复研究检查器添加
reproduction-checker-tag-readonly-origin = 原始文献在只读文献库中

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = 重复实验：计算成功，结果稳健
reproduction-checker-tag-outcome-cs-challenges = 重复实验：计算成功，稳健性存在挑战
reproduction-checker-tag-outcome-cs-not-checked = 重复实验：计算成功，稳健性未检查
reproduction-checker-tag-outcome-ci-robust = 重复实验：存在计算问题，结果稳健
reproduction-checker-tag-outcome-ci-challenges = 重复实验：存在计算问题，稳健性存在挑战
reproduction-checker-tag-outcome-ci-not-checked = 重复实验：存在计算问题，稳健性未检查

## Reproduction Feature - Note Template
reproduction-checker-note-title = 找到重复实验
reproduction-checker-note-warning = 此笔记为自动生成。如果您对其进行编辑，下次检查时将创建新笔记，本版本将保持原样。
reproduction-checker-note-intro = 本研究已被重复验证（复现）：
reproduction-checker-note-feedback = 您觉得此结果有用吗？请在<a href="{ $url }" target="_blank">此处</a>提供反馈！
reproduction-checker-note-data-issues = 您发现数据中有任何问题吗？请在<a href="{ $url }" target="_blank">此处</a>反馈！
reproduction-checker-note-footer = 由 Zotero 重复研究检查器使用 FORRT 文献数据库（FLoRA）生成

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
    确定要屏蔽 { $count } 篇重复实验吗？

    这些条目将被移至回收站，且不会在以后的检查中重新添加。
reproduction-checker-ban-success = 已成功屏蔽 { $count } 篇重复实验。

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = 找到重复实验
reproduction-checker-dialog-intro = 为以下文献找到重复实验：\n"{ $title }"
reproduction-checker-dialog-count = 找到 { $count } 篇重复实验：
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   结果：{ $outcome }
reproduction-checker-dialog-more = ...以及另外 { $count } 篇重复实验
reproduction-checker-dialog-question = 是否添加重复实验信息？
reproduction-checker-dialog-progress-title = 已添加重复实验信息
reproduction-checker-dialog-progress-line = 已向"{ $title }"添加重复实验信息

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = 找到 { $count } 个含有重复实验的条目

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
