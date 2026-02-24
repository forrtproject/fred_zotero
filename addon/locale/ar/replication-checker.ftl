# Zotero Replication Checker Locale File - Arabic (العربية)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = فحص المكتبة الحالية بحثاً عن التكرارات
replication-checker-context-menu = فحص التكرارات
replication-checker-context-menu-ban = حظر التكرار
replication-checker-context-menu-add-original = إضافة الأصل

## Progress Messages
replication-checker-progress-checking-library = جارٍ فحص التكرارات
replication-checker-progress-checking-collection = جارٍ فحص التكرارات في المجموعة
replication-checker-progress-scanning-library = جارٍ مسح المكتبة...
replication-checker-progress-scanning-collection = جارٍ مسح المجموعة...
replication-checker-progress-found-dois = تم العثور على { $itemCount } عنصر/عناصر بمعرّفات DOI ({ $uniqueCount } فريد/فريدة)
replication-checker-progress-checking-database = جارٍ الاستعلام عن قاعدة بيانات التكرارات...
replication-checker-progress-no-dois = لم يتم العثور على عناصر بمعرّفات DOI في المجموعة
replication-checker-progress-complete = اكتمل الفحص
replication-checker-progress-failed = فشل الفحص
replication-checker-progress-match-count = تم العثور على { $count } عنصر/عناصر بتكرارات
replication-checker-progress-copying-readonly = جارٍ نسخ العناصر من المكتبة للقراءة فقط إلى المكتبة الشخصية...

## Alerts
replication-checker-alert-title = مدقق التكرارات في زوتيرو
replication-checker-alert-no-dois-selected = لم يتم العثور على معرّفات DOI في العناصر المحددة.
replication-checker-alert-no-collection = يرجى تحديد مجموعة قبل تشغيل هذا الفحص.
replication-checker-alert-no-originals-available = لا توجد دراسات أصلية متاحة لهذا التكرار.
replication-checker-alert-no-doi = العنصر المحدد لا يحتوي على معرّف DOI.
replication-checker-add-original-success = تمت إضافة الدراسة الأصلية بنجاح: { $title }
replication-checker-add-original-confirm = تم العثور على { $count } دراسة/دراسات أصلية لهذا التكرار. هل تريد إضافتها جميعاً إلى مكتبتك؟
replication-checker-add-original-batch-success = تمت إضافة { $count } دراسة/دراسات أصلية بنجاح إلى مكتبتك.
replication-checker-error-title = مدقق التكرارات - خطأ
replication-checker-error-api = تعذّر استرداد البيانات من واجهة برمجة التطبيقات - تحقق من اتصالك بالإنترنت أو أعد المحاولة لاحقاً.
replication-checker-error-body =
    فشل في فحص { $target } بحثاً عن التكرارات:

    { $details }

    تعذّر استرداد البيانات من واجهة برمجة التطبيقات - تحقق من اتصالك بالإنترنت أو أعد المحاولة لاحقاً.
replication-checker-target-library = المكتبة الحالية
replication-checker-target-selected = العناصر المحددة
replication-checker-target-collection = المجموعة المحددة

## Ban Feature
replication-checker-ban-title = حظر التكرارات
replication-checker-ban-confirm =
    هل أنت متأكد من رغبتك في حظر { $count } تكرار/تكرارات؟

    سيتم نقل هذه العناصر إلى سلة المحذوفات ولن تُضاف مجدداً في عمليات الفحص المستقبلية.
replication-checker-ban-success = تم حظر { $count } تكرار/تكرارات بنجاح.
replication-checker-alert-no-replications-selected = لم يتم تحديد أي عناصر تكرار.

## Dialog
replication-checker-dialog-title = تم العثور على دراسات التكرار
replication-checker-dialog-intro = تم العثور على دراسات التكرار لـ:\n"{ $title }"
replication-checker-dialog-count = تم العثور على { $count } تكرار/تكرارات:
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   النتيجة: { $outcome }
replication-checker-dialog-more = ...و{ $count } تكرار/تكرارات أخرى
replication-checker-dialog-question = هل تريد إضافة معلومات التكرار؟
replication-checker-dialog-progress-title = تمت إضافة معلومات التكرار
replication-checker-dialog-progress-line = تمت إضافة معلومات التكرار إلى "{ $title }"
replication-checker-dialog-is-replication-title = تم العثور على الدراسة الأصلية
replication-checker-dialog-is-replication-message = لم يتم العثور على تكرارات، لكن يبدو أن هذا دراسة تكرار.\n\nهل تريد إضافة المقال/المقالات الأصلية؟

## Read-Only Library Handling
replication-checker-readonly-dialog-title = تم اكتشاف مكتبة للقراءة فقط
replication-checker-readonly-dialog-message =
    هذه المكتبة للقراءة فقط. وجدنا { $itemCount } عنصر/عناصر مع { $replicationCount } تكرار/تكرارات.

    هل تريد نسخ المقالات الأصلية وتكراراتها إلى "مجلد التكرارات" في مكتبتك الشخصية؟

## Results Messages
replication-checker-results-title-library = اكتمل مسح المكتبة
replication-checker-results-title-selected = اكتمل مسح العناصر المحددة
replication-checker-results-title-collection = اكتمل مسح المجموعة
replication-checker-results-total = إجمالي العناصر التي تم فحصها: { $count }
replication-checker-results-dois = العناصر التي تحتوي على DOI: { $count }
replication-checker-results-found = { $count } عنصر/عناصر لديها تكرارات.
replication-checker-results-none = لم يتم العثور على تكرارات.
replication-checker-results-reproductions-found = { $count } عنصر/عناصر لديها استنساخات.
replication-checker-results-reproductions-none = لم يتم العثور على استنساخات.
replication-checker-results-footer = راجع الملاحظات للتفاصيل أو حدد العناصر لإعادة الفحص.

## Tags
replication-checker-tag = يحتوي على تكرار
replication-checker-tag-is-replication = دراسة تكرار
replication-checker-tag-added-by-checker = أضافه مدقق التكرارات
replication-checker-tag-success = تكرار: ناجح
replication-checker-tag-failure = تكرار: فاشل
replication-checker-tag-mixed = تكرار: مختلط
replication-checker-tag-readonly-origin = الأصل موجود في مكتبة للقراءة فقط
replication-checker-tag-has-been-replicated = تم تكراره
replication-checker-tag-has-been-reproduced = تم استنساخه
replication-checker-tag-in-flora = في FLoRA

## Note Template
replication-checker-note-title = تم العثور على التكرارات
replication-checker-note-warning = يتم إنشاء هذه الملاحظة تلقائياً. إذا قمت بتعديلها، سيتم إنشاء ملاحظة جديدة في الفحص التالي وستُحفظ هذه النسخة كما هي.
replication-checker-note-intro = تمت دراسة هذا البحث بصورة مكررة:
replication-checker-note-feedback = هل وجدت هذه النتيجة مفيدة؟ قدّم ملاحظاتك <a href="{ $url }" target="_blank">هنا</a>!
replication-checker-note-data-issues = هل وجدت أي مشاكل في البيانات؟ يرجى الإبلاغ عنها <a href="{ $url }" target="_blank">هنا</a>!
replication-checker-note-footer = تم إنشاؤه بواسطة مدقق التكرارات في زوتيرو باستخدام قاعدة بيانات الأدبيات FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = لا يوجد عنوان متاح
replication-checker-li-no-authors = لا يوجد مؤلفون متاحون
replication-checker-li-no-journal = لا توجد مجلة
replication-checker-li-na = غ.م.
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = النتيجة التي أفاد بها المؤلف:
replication-checker-li-link = هذه الدراسة لها تقرير مرتبط:

## First Run Prompt
replication-checker-prompt-title = مرحباً بك في مدقق التكرارات في زوتيرو!
replication-checker-prompt-first-run =
    شكراً لتثبيت مدقق التكرارات في زوتيرو!

    يساعدك هذا الملحق في اكتشاف دراسات التكرار لأبحاثك من خلال فحص عناصر مكتبتك مقابل قاعدة بيانات الأدبيات FORRT (FLoRA).

    هل تريد مسح مكتبتك بحثاً عن التكرارات الآن؟

    • انقر على "موافق" لبدء المسح (قد يستغرق ذلك بضع دقائق)
    • انقر على "إلغاء" للتخطي - يمكنك دائماً إجراء المسح لاحقاً من قائمة الأدوات

## Onboarding
onboarding-welcome-title = مرحباً بك في مدقق التكرارات!
onboarding-welcome-content =
    شكراً لتثبيت مدقق التكرارات في زوتيرو!

    يساعدك هذا الملحق في اكتشاف دراسات التكرار من خلال الفحص التلقائي لعناصر مكتبتك مقابل قاعدة بيانات الأدبيات FORRT (FLoRA).

    ✨ الميزات الرئيسية:
    • الفحص التلقائي لمعرّفات DOI مقابل قاعدة بيانات التكرارات
    • يعمل مع المكتبة بأكملها أو المجموعات أو العناصر الفردية
    • ينشئ ملاحظات مرتبطة تحتوي على معلومات التكرار
    • يضع علامات على العناصر وفق حالة التكرار
    • يضيف الدراسات الأصلية عند وجود تكرارات
    • يحظر التكرارات غير المرغوب فيها من عمليات الفحص المستقبلية

    لنقم بجولة سريعة للبدء!

onboarding-tools-title = فحص مكتبتك بأكملها
onboarding-tools-content =
    📍 الموقع: الأدوات ← فحص المكتبة الحالية بحثاً عن التكرارات

    🔍 ما يقوم به:
    • يمسح جميع العناصر التي تحتوي على معرّفات DOI
    • يستعلم عن قاعدة بيانات FLoRA
    • ينشئ ملاحظات تحتوي على التفاصيل
    • يضع علامات على العناصر وفق النتيجة

    💡 نصيحة: يستغرق بضع دقائق حسب حجم المكتبة.

onboarding-context-title = فحص المجموعات والعناصر
onboarding-context-content =
    📚 للمجموعات:
    انقر بزر الفأرة الأيمن على المجموعة ← فحص التكرارات

    📄 للعناصر الفردية:
    انقر بزر الفأرة الأيمن على العناصر ← فحص التكرارات

    🚫 حظر التكرارات:
    انقر بزر الفأرة الأيمن على عناصر التكرار ← حظر التكرار
    • يمنع إعادة إضافة التكرارات غير المرغوب فيها

    ⚙️ التفضيلات:
    تحرير ← الإعدادات ← مدقق التكرارات
    • تكرار الفحص التلقائي
    • الفحص التلقائي للعناصر الجديدة

onboarding-scan-title = هل أنت مستعد لمسح مكتبتك؟
onboarding-scan-content =
    هل تريد مسح مكتبتك بحثاً عن التكرارات الآن؟

    • انقر على "نعم" لبدء المسح
      (قد يستغرق ذلك بضع دقائق)

    • انقر على "لا" للتخطي - يمكنك دائماً إجراء المسح لاحقاً من قائمة الأدوات

    💡 يمكنك الوصول إلى هذا الدليل في أي وقت:
    مساعدة ← دليل المستخدم لمدقق التكرارات

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = حظر الاستنساخ

## Reproduction Feature - Tags
reproduction-checker-tag = يحتوي على استنساخ
reproduction-checker-tag-is-reproduction = دراسة استنساخ
reproduction-checker-tag-added-by-checker = أضافه مدقق التكرارات
reproduction-checker-tag-readonly-origin = الأصل موجود في مكتبة للقراءة فقط

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = استنساخ: نجح حسابياً، قوي
reproduction-checker-tag-outcome-cs-challenges = استنساخ: نجح حسابياً، تحديات في المتانة
reproduction-checker-tag-outcome-cs-not-checked = استنساخ: نجح حسابياً، لم تُفحص المتانة
reproduction-checker-tag-outcome-ci-robust = استنساخ: مشاكل حسابية، قوي
reproduction-checker-tag-outcome-ci-challenges = استنساخ: مشاكل حسابية، تحديات في المتانة
reproduction-checker-tag-outcome-ci-not-checked = استنساخ: مشاكل حسابية، لم تُفحص المتانة

## Reproduction Feature - Note Template
reproduction-checker-note-title = تم العثور على الاستنساخات
reproduction-checker-note-warning = يتم إنشاء هذه الملاحظة تلقائياً. إذا قمت بتعديلها، سيتم إنشاء ملاحظة جديدة في الفحص التالي وستُحفظ هذه النسخة كما هي.
reproduction-checker-note-intro = تمت دراسة هذا البحث باستنساخه:
reproduction-checker-note-feedback = هل وجدت هذه النتيجة مفيدة؟ قدّم ملاحظاتك <a href="{ $url }" target="_blank">هنا</a>!
reproduction-checker-note-data-issues = هل وجدت أي مشاكل في البيانات؟ يرجى الإبلاغ عنها <a href="{ $url }" target="_blank">هنا</a>!
reproduction-checker-note-footer = تم إنشاؤه بواسطة مدقق التكرارات في زوتيرو باستخدام قاعدة بيانات الأدبيات FORRT (FLoRA)

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = لا يوجد عنوان متاح
reproduction-checker-li-no-authors = لا يوجد مؤلفون متاحون
reproduction-checker-li-no-journal = لا توجد مجلة
reproduction-checker-li-na = غ.م.
reproduction-checker-li-doi-label = DOI:
reproduction-checker-li-outcome = نتيجة الاستنساخ:
reproduction-checker-li-link = هذه الدراسة لها تقرير مرتبط:

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = لم يتم تحديد أي عناصر استنساخ.
reproduction-checker-ban-title = حظر الاستنساخات
reproduction-checker-ban-confirm =
    هل أنت متأكد من رغبتك في حظر { $count } استنساخ/استنساخات؟

    سيتم نقل هذه العناصر إلى سلة المحذوفات ولن تُضاف مجدداً في عمليات الفحص المستقبلية.
reproduction-checker-ban-success = تم حظر { $count } استنساخ/استنساخات بنجاح.

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = تم العثور على دراسات الاستنساخ
reproduction-checker-dialog-intro = تم العثور على دراسات الاستنساخ لـ:\n"{ $title }"
reproduction-checker-dialog-count = تم العثور على { $count } استنساخ/استنساخات:
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   النتيجة: { $outcome }
reproduction-checker-dialog-more = ...و{ $count } استنساخ/استنساخات أخرى
reproduction-checker-dialog-question = هل تريد إضافة معلومات الاستنساخ؟
reproduction-checker-dialog-progress-title = تمت إضافة معلومات الاستنساخ
reproduction-checker-dialog-progress-line = تمت إضافة معلومات الاستنساخ إلى "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = تم العثور على { $count } عنصر/عناصر بالاستنساخات

## Preference Pane
pref-autocheck-title = الفحص التلقائي للمكتبة بحثاً عن التكرارات
pref-autocheck-description = فحص مكتبتك تلقائياً بحثاً عن دراسات التكرار على فترات منتظمة
pref-autocheck-disabled = معطّل (الفحص اليدوي فقط)
pref-autocheck-daily = يومي (فحص كل 24 ساعة)
pref-autocheck-weekly = أسبوعي (فحص كل 7 أيام)
pref-autocheck-monthly = شهري (فحص كل 30 يوماً)
pref-autocheck-new-items = فحص العناصر الجديدة المضافة إلى المكتبة تلقائياً (موصى به)
pref-autocheck-new-items-hint = عطّل هذا الخيار إذا كنت تفضل إجراء جميع عمليات فحص التكرار يدوياً.
pref-autocheck-note = يعمل الفحص التلقائي في الخلفية عند فتح زوتيرو. لا يزال بإمكانك إجراء الفحص يدوياً من قائمة الأدوات.
pref-blacklist-title = التكرارات المحظورة
pref-blacklist-description = إدارة التكرارات التي حظرتها من الظهور في مكتبتك
pref-blacklist-col-replication = مقالة التكرار
pref-blacklist-col-original = المقالة الأصلية
pref-blacklist-col-type = النوع
pref-blacklist-col-banned = تاريخ الحظر
pref-blacklist-empty = لا توجد تكرارات محظورة
pref-blacklist-remove = إزالة المحدد
pref-blacklist-clear = مسح جميع التكرارات المحظورة
pref-blacklist-hint = لن تُضاف التكرارات المحظورة مجدداً في عمليات الفحص المستقبلية. يمكنك حظر التكرارات باستخدام قائمة السياق.
