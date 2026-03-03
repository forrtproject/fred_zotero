# Zotero Replication Checker Locale File - Spanish (Español)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Verificar replicaciones en la biblioteca actual
replication-checker-context-menu = Verificar replicaciones
replication-checker-context-menu-ban = Bloquear replicación
replication-checker-context-menu-add-original = Añadir original

## Progress Messages
replication-checker-progress-checking-library = Verificando replicaciones
replication-checker-progress-checking-collection = Verificando replicaciones en la colección
replication-checker-progress-scanning-library = Analizando biblioteca...
replication-checker-progress-scanning-collection = Analizando colección...
replication-checker-progress-found-dois = Se encontraron { $itemCount } elementos con DOI ({ $uniqueCount } únicos)
replication-checker-progress-checking-database = Consultando base de datos de replicaciones...
replication-checker-progress-no-dois = No se encontraron elementos con DOI en la colección
replication-checker-progress-complete = Verificación completa
replication-checker-progress-failed = Verificación fallida
replication-checker-progress-match-count = Se encontraron { $count } elemento(s) con replicaciones
replication-checker-progress-copying-readonly = Copiando elementos de la biblioteca de solo lectura a la biblioteca personal...

## Alerts
replication-checker-alert-title = Verificador de replicaciones de Zotero
replication-checker-alert-no-dois-selected = No se encontraron DOI en los elementos seleccionados.
replication-checker-alert-no-collection = Por favor seleccione una colección antes de ejecutar esta verificación.
replication-checker-alert-no-originals-available = No hay estudios originales disponibles para esta replicación.
replication-checker-alert-no-doi = El elemento seleccionado no tiene DOI.
replication-checker-add-original-success = Estudio original añadido exitosamente: { $title }
replication-checker-add-original-confirm = Se encontraron { $count } estudio(s) original(es) para esta replicación. ¿Desea añadirlos todos a su biblioteca?
replication-checker-add-original-batch-success = Se añadieron exitosamente { $count } estudio(s) original(es) a su biblioteca.
replication-checker-error-title = Verificador de replicaciones - Error
replication-checker-error-api = No se pudieron recuperar datos de la API - verifique su conexión a Internet o inténtelo de nuevo más tarde.
replication-checker-error-body =
    Error al verificar { $target } para replicaciones:

    { $details }

    No se pudieron recuperar datos de la API - verifique su conexión a Internet o inténtelo de nuevo más tarde.
replication-checker-target-library = la biblioteca actual
replication-checker-target-selected = los elementos seleccionados
replication-checker-target-collection = la colección seleccionada

## Ban Feature
replication-checker-ban-title = Bloquear replicaciones
replication-checker-ban-confirm =
    ¿Está seguro de que desea bloquear { $count } replicación(es)?

    Estos elementos serán movidos a la papelera y no se añadirán de nuevo en futuras verificaciones.
replication-checker-ban-success = Se bloquearon exitosamente { $count } replicación(es).
replication-checker-alert-no-replications-selected = No se seleccionaron elementos de replicación.

## Dialog
replication-checker-dialog-title = Estudios de replicación encontrados
replication-checker-dialog-intro = Estudios de replicación encontrados para:\n"{ $title }"
replication-checker-dialog-count = Se encontraron { $count } replicación(es):
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Resultado: { $outcome }
replication-checker-dialog-more = ...y { $count } replicación(es) más
replication-checker-dialog-question = ¿Desea añadir información de replicación?
replication-checker-dialog-progress-title = Información de replicación añadida
replication-checker-dialog-progress-line = Información de replicación añadida a "{ $title }"
replication-checker-dialog-is-replication-title = Estudio original encontrado
replication-checker-dialog-is-replication-message = No se encontraron replicaciones, pero esto parece ser un estudio de replicación.\n\n¿Desea añadir el/los artículo(s) original(es)?

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Biblioteca de solo lectura detectada
replication-checker-readonly-dialog-message =
    Esta biblioteca es de solo lectura. Encontramos { $itemCount } elemento(s) con { $replicationCount } replicación(es).

    ¿Desea copiar los artículos originales y sus replicaciones a la "carpeta de replicaciones" de su biblioteca personal?

## Results Messages
replication-checker-results-title-library = Análisis de biblioteca completo
replication-checker-results-title-selected = Análisis de elementos seleccionados completo
replication-checker-results-title-collection = Análisis de colección completo
replication-checker-results-total = Total de elementos verificados: { $count }
replication-checker-results-dois = Elementos con DOI: { $count }
replication-checker-results-found = { $count } elemento(s) tiene(n) replicaciones.
replication-checker-results-none = No se encontraron replicaciones.
replication-checker-results-reproductions-found = { $count } elemento(s) tiene(n) reproducciones.
replication-checker-results-reproductions-none = No se encontraron reproducciones.
replication-checker-results-footer = Ver notas para detalles o seleccionar elementos para reverificar.

## Tags
replication-checker-tag = Tiene replicación
replication-checker-tag-is-replication = Es una replicación
replication-checker-tag-added-by-checker = Añadido por el verificador de replicaciones
replication-checker-tag-success = Replicación: Exitosa
replication-checker-tag-failure = Replicación: Fallida
replication-checker-tag-mixed = Replicación: Mixta
replication-checker-tag-readonly-origin = Original presente en biblioteca de solo lectura
replication-checker-tag-has-been-replicated = Ha sido replicado
replication-checker-tag-has-been-reproduced = Ha sido reproducido
replication-checker-tag-in-flora = En FLoRA

## Note Template
replication-checker-note-title = Replicaciones encontradas
replication-checker-note-warning = Esta nota es generada automáticamente. Si la edita, se creará una nueva nota en la próxima verificación y esta versión se conservará tal cual.
replication-checker-note-intro = Este estudio ha sido replicado:
replication-checker-note-feedback = ¿Encontró útil este resultado? Proporcione comentarios <a href="{ $url }" target="_blank">aquí</a>!
replication-checker-note-data-issues = ¿Encontró algún problema en los datos? Por favor repórtelo <a href="{ $url }" target="_blank">aquí</a>!
replication-checker-note-footer = Generado por el Verificador de replicaciones de Zotero usando la Base de datos de literatura FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Sin título disponible
replication-checker-li-no-authors = Sin autores disponibles
replication-checker-li-no-journal = Sin revista
replication-checker-li-na = N/D
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Resultado reportado por el autor:
replication-checker-li-link = Este estudio tiene un informe vinculado:

## First Run Prompt
replication-checker-prompt-title = ¡Bienvenido al Verificador de replicaciones de Zotero!
replication-checker-prompt-first-run =
    ¡Gracias por instalar el Verificador de replicaciones de Zotero!

    Este complemento le ayuda a descubrir estudios de replicación para su investigación verificando los elementos de su biblioteca en la Base de datos de literatura FORRT (FLoRA).

    ¿Desea analizar su biblioteca en busca de replicaciones ahora?

    • Haga clic en "Aceptar" para comenzar el análisis (esto puede tardar unos minutos)
    • Haga clic en "Cancelar" para omitir - siempre puede analizar más tarde desde el menú Herramientas

## Onboarding
onboarding-welcome-title = ¡Bienvenido al Verificador de replicaciones!
onboarding-welcome-content =
    ¡Gracias por instalar el Verificador de replicaciones de Zotero!

    Este complemento le ayuda a descubrir estudios de replicación verificando automáticamente los elementos de su biblioteca en la Base de datos de literatura FORRT (FLoRA).

    ✨ Características principales:
    • Verificación automática de DOI en la base de datos de replicaciones
    • Funciona con toda la biblioteca, colecciones o elementos individuales
    • Crea notas vinculadas con información de replicación
    • Etiqueta elementos con estado de replicación
    • Añade estudios originales cuando tiene replicaciones
    • Bloquea replicaciones no deseadas de futuras verificaciones

    ¡Hagamos un recorrido rápido para comenzar!

onboarding-tools-title = Verificar toda su biblioteca
onboarding-tools-content =
    📍 Ubicación: Herramientas → Verificar replicaciones en la biblioteca actual

    🔍 Qué hace:
    • Analiza todos los elementos con DOI
    • Consulta la base de datos FLoRA
    • Crea notas con detalles
    • Etiqueta elementos por resultado

    💡 Consejo: Tarda unos minutos dependiendo del tamaño de la biblioteca.

onboarding-context-title = Verificar colecciones y elementos
onboarding-context-content =
    📚 Para colecciones:
    Clic derecho en la colección → Verificar replicaciones

    📄 Para elementos individuales:
    Clic derecho en elementos → Verificar replicaciones

    🚫 Bloquear replicaciones:
    Clic derecho en elementos de replicación → Bloquear replicación
    • Evita que replicaciones no deseadas sean añadidas de nuevo

    ⚙️ Preferencias:
    Editar → Configuración → Verificador de replicaciones
    • Frecuencia de verificación automática
    • Verificación automática de nuevos elementos

onboarding-scan-title = ¿Listo para analizar su biblioteca?
onboarding-scan-content =
    ¿Desea analizar su biblioteca en busca de replicaciones ahora?

    • Haga clic en "Sí" para comenzar el análisis
      (esto puede tardar unos minutos)

    • Haga clic en "No" para omitir - siempre puede analizar más tarde desde el menú Herramientas

    💡 Acceda a esta guía en cualquier momento:
    Ayuda → Guía de usuario del Verificador de replicaciones

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Bloquear reproducción

## Reproduction Feature - Tags
reproduction-checker-tag = Tiene reproducción
reproduction-checker-tag-is-reproduction = Es una reproducción
reproduction-checker-tag-added-by-checker = Añadido por el verificador de replicaciones
reproduction-checker-tag-readonly-origin = Original presente en biblioteca de solo lectura

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reproducción: Computacionalmente exitosa, Robusta
reproduction-checker-tag-outcome-cs-challenges = Reproducción: Computacionalmente exitosa, Desafíos de robustez
reproduction-checker-tag-outcome-cs-not-checked = Reproducción: Computacionalmente exitosa, Robustez no verificada
reproduction-checker-tag-outcome-ci-robust = Reproducción: Problemas computacionales, Robusta
reproduction-checker-tag-outcome-ci-challenges = Reproducción: Problemas computacionales, Desafíos de robustez
reproduction-checker-tag-outcome-ci-not-checked = Reproducción: Problemas computacionales, Robustez no verificada

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproducciones encontradas
reproduction-checker-note-warning = Esta nota es generada automáticamente. Si la edita, se creará una nueva nota en la próxima verificación y esta versión se conservará tal cual.
reproduction-checker-note-intro = Este estudio ha sido reproducido:
reproduction-checker-note-feedback = ¿Encontró útil este resultado? Proporcione comentarios <a href="{ $url }" target="_blank">aquí</a>!
reproduction-checker-note-data-issues = ¿Encontró algún problema en los datos? Por favor repórtelo <a href="{ $url }" target="_blank">aquí</a>!
reproduction-checker-note-footer = Generado por el Verificador de replicaciones de Zotero usando la Base de datos de literatura FORRT (FLoRA)

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = Sin título disponible
reproduction-checker-li-no-authors = Sin autores disponibles
reproduction-checker-li-no-journal = Sin revista
reproduction-checker-li-na = N/D
reproduction-checker-li-doi-label = DOI:
reproduction-checker-li-outcome = Resultado de la reproducción:
reproduction-checker-li-link = Este estudio tiene un informe vinculado:

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = No se seleccionaron elementos de reproducción.
reproduction-checker-ban-title = Bloquear reproducciones
reproduction-checker-ban-confirm =
    ¿Está seguro de que desea bloquear { $count } reproducción(es)?

    Estos elementos serán movidos a la papelera y no se añadirán de nuevo en futuras verificaciones.
reproduction-checker-ban-success = Se bloquearon exitosamente { $count } reproducción(es).

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = Estudios de reproducción encontrados
reproduction-checker-dialog-intro = Estudios de reproducción encontrados para:\n"{ $title }"
reproduction-checker-dialog-count = Se encontraron { $count } reproducción(es):
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Resultado: { $outcome }
reproduction-checker-dialog-more = ...y { $count } reproducción(es) más
reproduction-checker-dialog-question = ¿Desea añadir información en el/los estudio/s de reproducción encontrados?
reproduction-checker-dialog-progress-title = Información de reproducción añadida
reproduction-checker-dialog-progress-line = Información de reproducción añadida a "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = Se encontraron { $count } elemento(s) con reproducciones

## Preference Pane
pref-autocheck-title = Verificación automática de biblioteca para replicaciones
pref-autocheck-description = Verificar automáticamente su biblioteca para estudios de replicación en intervalos regulares
pref-autocheck-disabled = Desactivado (solo verificación manual)
pref-autocheck-daily = Diario (verificar cada 24 horas)
pref-autocheck-weekly = Semanal (verificar cada 7 días)
pref-autocheck-monthly = Mensual (verificar cada 30 días)
pref-autocheck-new-items = Verificar automáticamente los nuevos elementos añadidos a la biblioteca (recomendado)
pref-autocheck-new-items-hint = Desactive esta opción si prefiere ejecutar todas las verificaciones de replicación manualmente.
pref-autocheck-note = La verificación automática se ejecuta en segundo plano cuando Zotero está abierto. Aún puede verificar manualmente usando el menú Herramientas.
pref-blacklist-title = Replicaciones bloqueadas
pref-blacklist-description = Gestionar replicaciones que ha bloqueado de su biblioteca
pref-blacklist-col-replication = Artículo de replicación
pref-blacklist-col-original = Artículo original
pref-blacklist-col-type = Tipo
pref-blacklist-col-banned = Bloqueado el
pref-blacklist-empty = No hay replicaciones bloqueadas
pref-blacklist-remove = Eliminar selección
pref-blacklist-clear = Limpiar todas las replicaciones bloqueadas
pref-blacklist-hint = Las replicaciones bloqueadas no se añadirán de nuevo en futuras verificaciones. Puede bloquear replicaciones usando el menú contextual.
