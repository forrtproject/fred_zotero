# Zotero Replication Checker Locale File - Arabic (العربية)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = فحص المكتبة الحالية بحثاً عن التكرارات
replication-checker-context-menu = فحص التكرارات
replication-checker-context-menu-ban = حظر التكرار
replication-checker-context-menu-add-original = إضافة الأصل
replication-checker-context-menu-add-originals = إضافة الأصول

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
replication-checker-progress-match-count =
    { $count ->
        [one] تم العثور على عنصر واحد بتكرارات
       *[other] تم العثور على { $count } عنصر/عناصر بتكرارات
    }
replication-checker-progress-copying-readonly = جارٍ نسخ العناصر من المكتبة للقراءة فقط إلى المكتبة الشخصية...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = لم يتم العثور على معرّفات DOI في العناصر المحددة.
replication-checker-alert-no-collection = يرجى تحديد مجموعة قبل تشغيل هذا الفحص.
replication-checker-alert-no-originals-available = لا توجد دراسات أصلية متاحة لهذا التكرار.
replication-checker-alert-no-doi = العنصر المحدد لا يحتوي على معرّف DOI.
replication-checker-add-original-success = تمت إضافة "{ $title }" بنجاح إلى "{ $folderName }".
replication-checker-add-original-exists = "{ $title }" موجود بالفعل في مكتبتك — تم تحديث العلامات والملاحظات والعلاقات في "{ $folderName }".
replication-checker-add-original-add-all-btn = إضافة جميع الأصول
replication-checker-add-original-confirm =
    { $count ->
        [one] تم العثور على مقالة أصلية واحدة لهذا التكرار. يرجى تحديد الأصول التي تريد إضافتها إلى مكتبتك.
       *[other] تم العثور على { $count } مقالة/مقالات أصلية لهذا التكرار. يرجى تحديد الأصول التي تريد إضافتها إلى مكتبتك.
    }
replication-checker-add-original-select-btn = اختر الأصول التي تريد إضافتها
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] تمت إضافة دراسة أصلية جديدة واحدة وتحديث { $existingCount } دراسة/دراسات أصلية موجودة في "{ $folderName }".
       *[other] تمت إضافة { $newCount } دراسة/دراسات أصلية جديدة وتحديث { $existingCount } دراسة/دراسات أصلية موجودة في "{ $folderName }".
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] تمت إضافة دراسة أصلية واحدة بنجاح إلى "{ $folderName }".
       *[other] تمت إضافة { $count } دراسة/دراسات أصلية بنجاح إلى "{ $folderName }".
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] دراسة أصلية واحدة موجودة بالفعل في مكتبتك — تم تحديث العلامات والملاحظات والعلاقات في "{ $folderName }".
       *[other] { $count } دراسة/دراسات أصلية موجودة بالفعل في مكتبتك — تم تحديث العلامات والملاحظات والعلاقات في "{ $folderName }".
    }
replication-checker-error-title = Replication Checker - خطأ
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
    { $count ->
        [one] هل أنت متأكد من رغبتك في حظر تكرار واحد؟
       *[other] هل أنت متأكد من رغبتك في حظر { $count } تكرار/تكرارات؟
    }

    سيتم نقل هذه العناصر إلى سلة المحذوفات ولن تُضاف مجدداً في عمليات الفحص المستقبلية.
replication-checker-ban-success =
    { $count ->
        [one] تم حظر تكرار واحد بنجاح.
       *[other] تم حظر { $count } تكرار/تكرارات بنجاح.
    }
replication-checker-alert-no-replications-selected = لم يتم تحديد أي عناصر تكرار.

## Dialog
replication-checker-dialog-title = تم العثور على دراسات التكرار
replication-checker-dialog-intro =
    تم العثور على دراسات التكرار لـ:
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] تم العثور على تكرار واحد:
       *[other] تم العثور على { $count } تكرار/تكرارات:
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       النتيجة: { $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...وتكرار واحد آخر
       *[other] ...و{ $count } تكرار/تكرارات أخرى
    }
replication-checker-dialog-question = هل تريد إضافة معلومات التكرار؟
replication-checker-dialog-progress-title = تمت إضافة معلومات التكرار
replication-checker-dialog-progress-line = تمت إضافة معلومات التكرار إلى "{ $title }"
replication-checker-notif-replication-new =
    { $count ->
        [one] تمت إضافة تكرار جديد واحد بنجاح إلى "{ $folderName }".
       *[other] تمت إضافة { $count } تكرار/تكرارات جديدة بنجاح إلى "{ $folderName }".
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] تكرار واحد موجود بالفعل في مكتبتك — تم تحديث العلامات والملاحظات والعلاقات في "{ $folderName }".
       *[other] { $count } تكرار/تكرارات موجودة بالفعل في مكتبتك — تم تحديث العلامات والملاحظات والعلاقات في "{ $folderName }".
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] تمت إضافة تكرار جديد واحد وتحديث { $existingCount } تكرار/تكرارات موجودة في "{ $folderName }".
       *[other] تمت إضافة { $newCount } تكرار/تكرارات جديدة وتحديث { $existingCount } تكرار/تكرارات موجودة في "{ $folderName }".
    }
replication-checker-dialog-is-replication-title = تم العثور على الدراسة الأصلية
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] لم يتم العثور على تكرارات، لكن يبدو أن هذا دراسة تكرار. تم العثور على مقالة أصلية واحدة. هل تريد إضافتها إلى مكتبتك؟
       *[other] لم يتم العثور على تكرارات، لكن يبدو أن هذا دراسة تكرار. تم العثور على { $count } مقالة/مقالات أصلية. يرجى تحديد الأصول التي تريد إضافتها إلى مكتبتك.
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = تم اكتشاف مكتبة للقراءة فقط
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] هذه المكتبة للقراءة فقط. وجدنا { $itemCount } عنصر/عناصر مع تكرار واحد.
       *[other] هذه المكتبة للقراءة فقط. وجدنا { $itemCount } عنصر/عناصر مع { $replicationCount } تكرار/تكرارات.
    }

    هل تريد نسخ المقالات الأصلية وتكراراتها إلى "مجلد التكرارات" في مكتبتك الشخصية؟

## Results Messages
replication-checker-results-title-library = اكتمل مسح المكتبة
replication-checker-results-title-selected = اكتمل مسح العناصر المحددة
replication-checker-results-title-collection = اكتمل مسح المجموعة
replication-checker-results-total = إجمالي العناصر التي تم فحصها: { $count }
replication-checker-results-dois = العناصر التي تحتوي على DOI: { $count }
replication-checker-results-found =
    { $count ->
        [one] عنصر واحد لديه تكرارات، مخزّن في "{ $folderName }".
       *[other] { $count } عنصر/عناصر لديها تكرارات، مخزّنة في "{ $folderName }".
    }
replication-checker-results-none = لم يتم العثور على تكرارات.
replication-checker-results-reproductions-found =
    { $count ->
        [one] عنصر واحد لديه استنساخات، مخزّن في "{ $folderName }".
       *[other] { $count } عنصر/عناصر لديها استنساخات، مخزّنة في "{ $folderName }".
    }
replication-checker-results-reproductions-none = لم يتم العثور على استنساخات.
replication-checker-results-footer = راجع الملاحظات للتفاصيل أو حدد العناصر لإعادة الفحص.

## Tags
replication-checker-tag = تم تكراره
replication-checker-tag-is-replication = دراسة تكرار
replication-checker-tag-added-by-checker = أضافه Replication Checker
replication-checker-tag-success = تكرار: ناجح
replication-checker-tag-failure = تكرار: فاشل
replication-checker-tag-mixed = تكرار: مختلط
replication-checker-tag-multiple-originals = تكرار: أصول متعددة
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
replication-checker-note-footer = تم إنشاؤه بواسطة Zotero Replication Checker باستخدام قاعدة بيانات الأدبيات FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = لا يوجد عنوان متاح
replication-checker-li-no-authors = لا يوجد مؤلفون متاحون
replication-checker-li-no-journal = لا توجد مجلة
replication-checker-li-na = غ.م.
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = النتيجة التي أفاد بها المؤلف:
replication-checker-li-link = هذه الدراسة لها تقرير مرتبط:

## First Run Prompt
replication-checker-prompt-title = مرحباً بك في Zotero Replication Checker!
replication-checker-prompt-first-run =
    شكراً لتثبيت Zotero Replication Checker!

    يساعدك هذا الملحق في اكتشاف دراسات التكرار لأبحاثك من خلال فحص عناصر مكتبتك مقابل قاعدة بيانات الأدبيات FORRT (FLoRA).

    هل تريد مسح مكتبتك بحثاً عن التكرارات الآن؟

    • انقر على "موافق" لبدء المسح (قد يستغرق ذلك بضع دقائق)
    • انقر على "إلغاء" للتخطي - يمكنك دائماً إجراء المسح لاحقاً من قائمة الأدوات

## Onboarding
onboarding-welcome-title = مرحباً بك في Replication Checker!
onboarding-welcome-content =
    شكراً لتثبيت Zotero Replication Checker!

    يساعدك هذا الملحق في اكتشاف دراسات التكرار والإعادة الحسابية من خلال الفحص التلقائي لعناصر مكتبتك مقابل قاعدة بيانات الأدبيات FORRT (FLoRA).

    ✨ الميزات الرئيسية:
    • يفحص المكتبة بأكملها أو المجموعات أو العناصر الفردية
    • يكتشف التكرارات والإعادات الحسابية معاً
    • يتعامل مع المقالات التي لها أكثر من دراسة أصلية
    • يضيف ملاحظات موسومة بالنتائج تحتوي على روابط DOI
    • يضع علامات تلقائية على العناصر (مثل «له تكرار»، «هو تكرار»)
    • يقترح إضافة الدراسة الأصلية عند اكتشاف تكرار
    • يدعم المكتبات الجماعية للقراءة فقط — ينسخ العناصر إلى المكتبة الشخصية
    • جميع المجموعات داخل مجموعة واحدة «FLoRA»، بأسماء قابلة للتخصيص
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

    🗂️ أين تُحفظ العناصر:
    كل ما ينشئه الملحق يوجد داخل مجموعة واحدة باسم «FLoRA»
    • FLoRA Replications، FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ التفضيلات:
    تحرير ← الإعدادات ← Replication Checker
    • تكرار الفحص التلقائي
    • الفحص التلقائي للعناصر الجديدة
    • أسماء المجموعات، بما في ذلك حاوية «FLoRA»
    • إحصاءات FLoRA لكل مكتبة، مع رابط إلى Replication Atlas

onboarding-stats-title = إحصاءات FLoRA الخاصة بك
onboarding-stats-content =
    📍 الموقع: تحرير ← الإعدادات ← Replication Checker

    📊 أعداد محدَّثة لما تعرفه FLoRA عن مكتبتك:
    • المقالات التي لها تكرارات / إعادات حسابية
    • المقالات التي هي نفسها تكرارات أو إعادات حسابية
    • تُحسب حسب معرّف DOI الفريد، فالمقالة نفسها المحفوظة مرتين تُحسب مرة واحدة

    📚 مكتبات المجموعات:
    إذا كنت عضوًا في أي منها، يظهر مُحدِّد مكتبة أعلى الجدول — وتخص الإحصاءات المكتبة التي تختارها، لا مكتبتك الشخصية وحدها.

    🌍 الفتح في FLoRA Atlas:
    يفتح Replication Atlas محمَّلًا مسبقًا بمعرّفات DOI المتتبَّعة من المكتبة المحددة، لترى موضع قراءاتك ضمن أدبيات التكرار الأوسع.

    💡 العناصر التي لا تحتوي على معرّف DOI صالح لا يمكن تحديدها، لذا تُستبعد — ويذكر تنبيه أسفل الزر عددها.

onboarding-scan-title = هل أنت مستعد لمسح مكتبتك؟
onboarding-scan-content =
    هل تريد مسح مكتبتك بحثاً عن التكرارات الآن؟

    • انقر على "نعم" لبدء المسح
      (قد يستغرق ذلك بضع دقائق)

    • انقر على "لا" للتخطي - يمكنك دائماً إجراء المسح لاحقاً من قائمة الأدوات

    💡 يمكنك الوصول إلى هذا الدليل في أي وقت:
    مساعدة ← دليل المستخدم لـ Replication Checker

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = حظر الاستنساخ

## Reproduction Feature - Tags
reproduction-checker-tag = تم استنساخه
reproduction-checker-tag-is-reproduction = دراسة استنساخ
reproduction-checker-tag-added-by-checker = أضافه Replication Checker
reproduction-checker-tag-readonly-origin = الأصل موجود في مكتبة للقراءة فقط

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = استنساخ: نجح حسابياً، قوي
reproduction-checker-tag-outcome-cs-challenges = استنساخ: نجح حسابياً، تحديات في المتانة
reproduction-checker-tag-outcome-cs-not-checked = استنساخ: نجح حسابياً، لم تُفحص المتانة
reproduction-checker-tag-outcome-ci-robust = استنساخ: مشاكل حسابية، قوي
reproduction-checker-tag-outcome-ci-challenges = استنساخ: مشاكل حسابية، تحديات في المتانة
reproduction-checker-tag-outcome-ci-not-checked = استنساخ: مشاكل حسابية، لم تُفحص المتانة
reproduction-checker-tag-multiple-originals = استنساخ: أصول متعددة

## Reproduction Feature - Note Template
reproduction-checker-note-title = تم العثور على الاستنساخات
reproduction-checker-note-warning = يتم إنشاء هذه الملاحظة تلقائياً. إذا قمت بتعديلها، سيتم إنشاء ملاحظة جديدة في الفحص التالي وستُحفظ هذه النسخة كما هي.
reproduction-checker-note-intro = تمت دراسة هذا البحث باستنساخه:
reproduction-checker-note-feedback = هل وجدت هذه النتيجة مفيدة؟ قدّم ملاحظاتك <a href="{ $url }" target="_blank">هنا</a>!
reproduction-checker-note-data-issues = هل وجدت أي مشاكل في البيانات؟ يرجى الإبلاغ عنها <a href="{ $url }" target="_blank">هنا</a>!
reproduction-checker-note-footer = تم إنشاؤه بواسطة Zotero Replication Checker باستخدام قاعدة بيانات الأدبيات FORRT (FLoRA)

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
    { $count ->
        [one] هل أنت متأكد من رغبتك في حظر استنساخ واحد؟
       *[other] هل أنت متأكد من رغبتك في حظر { $count } استنساخ/استنساخات؟
    }

    سيتم نقل هذه العناصر إلى سلة المحذوفات ولن تُضاف مجدداً في عمليات الفحص المستقبلية.
reproduction-checker-ban-success =
    { $count ->
        [one] تم حظر استنساخ واحد بنجاح.
       *[other] تم حظر { $count } استنساخ/استنساخات بنجاح.
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = تم العثور على دراسات ذات صلة
replication-checker-dialog-intro-studies =
    تم العثور على دراسات لـ:
    «{ $title }»
replication-checker-dialog-question-studies = هل تريد إضافة هذه المعلومات إلى مكتبتك؟
reproduction-checker-dialog-title = تم العثور على دراسات الاستنساخ
reproduction-checker-dialog-intro =
    تم العثور على دراسات الاستنساخ لـ:
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] تم العثور على استنساخ واحد:
       *[other] تم العثور على { $count } استنساخ/استنساخات:
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       النتيجة: { $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...واستنساخ واحد آخر
       *[other] ...و{ $count } استنساخ/استنساخات أخرى
    }
reproduction-checker-dialog-question = هل تريد إضافة معلومات الاستنساخ؟
reproduction-checker-dialog-progress-title = تمت إضافة معلومات الاستنساخ
reproduction-checker-dialog-progress-line = تمت إضافة معلومات الاستنساخ إلى "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] تم العثور على عنصر واحد بالاستنساخات
       *[other] تم العثور على { $count } عنصر/عناصر بالاستنساخات
    }

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
pref-folder-title = اسم مجلد التكرارات
pref-folder-description = اسم مجموعة Zotero التي تُخزَّن فيها عناصر التكرار
pref-folder-hint = سيؤدي تغيير هذا إلى إعادة تسمية المجموعة الموجودة تلقائياً. ستبقى جميع العناصر في نفس المجموعة.
pref-repro-folder-title = اسم مجلد الاستنساخات
pref-repro-folder-description = اسم مجموعة Zotero التي تُخزَّن فيها عناصر الاستنساخ
pref-repro-folder-hint = سيؤدي تغيير هذا إلى إعادة تسمية المجموعة الموجودة تلقائياً. ستبقى جميع العناصر في نفس المجموعة.
pref-originals-replication-folder-title = مجلد الأصول (مرتبط بالتكرارات)
pref-originals-replication-folder-description = اسم مجموعة Zotero التي تُخزَّن فيها المقالات الأصلية (التي أُضيفت تكراراتها)
pref-originals-replication-folder-hint = سيؤدي تغيير هذا إلى إعادة تسمية المجموعة الموجودة تلقائياً. ستبقى جميع العناصر في نفس المجموعة.
pref-originals-reproduction-folder-title = مجلد الأصول (مرتبط بالاستنساخات)
pref-originals-reproduction-folder-description = اسم مجموعة Zotero التي تُخزَّن فيها المقالات الأصلية (التي أُضيفت استنساخاتها)
pref-originals-reproduction-folder-hint = سيؤدي تغيير هذا إلى إعادة تسمية المجموعة الموجودة تلقائياً. ستبقى جميع العناصر في نفس المجموعة.

## Stats Pane
pref-stats-title = إحصاءات FLoRA الخاصة بك
pref-stats-description = إحصاءات مبنية على مكتبة Zotero الحالية
pref-stats-has-replication = مقالات لها تكرارات
pref-stats-has-reproduction = مقالات لها استنساخات
pref-stats-is-replication = مقالات محددة كتكرارات
pref-stats-originals = المقالات الأصلية المتتبعة
pref-stats-refresh = تحديث الإحصاءات
pref-stats-no-originals = لم يتم العثور على مقالات أصلية متتبعة في مكتبتك. قم بإجراء فحص التكرارات أولاً.
pref-stats-open-atlas = افتح في FLoRA Atlas ↗
pref-stats-view-flora = عرض قاعدة بيانات FLoRA ←

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
