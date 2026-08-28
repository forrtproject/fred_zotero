# Zotero Replication Checker Locale File - Spanish (Español)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Verificar replicaciones en la biblioteca actual
replication-checker-context-menu = Verificar replicaciones
replication-checker-context-menu-ban = Bloquear replicación
replication-checker-context-menu-add-original = Añadir original
replication-checker-context-menu-add-originals = Añadir originales

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
replication-checker-progress-match-count =
    { $count ->
        [one] Se encontró 1 elemento con replicaciones
       *[other] Se encontraron { $count } elementos con replicaciones
    }
replication-checker-progress-copying-readonly = Copiando elementos de la biblioteca de solo lectura a la biblioteca personal...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = No se encontraron DOI en los elementos seleccionados.
replication-checker-alert-no-collection = Por favor seleccione una colección antes de ejecutar esta verificación.
replication-checker-alert-no-originals-available = No hay estudios originales disponibles para esta replicación.
replication-checker-alert-no-doi = El elemento seleccionado no tiene DOI.
replication-checker-add-original-success = "{ $title }" añadido con éxito a "{ $folderName }".
replication-checker-add-original-exists = "{ $title }" ya está en su biblioteca — etiquetas, notas y relaciones actualizadas en "{ $folderName }".
replication-checker-add-original-add-all-btn = Añadir todos los originales
replication-checker-add-original-confirm =
    { $count ->
        [one] Se encontró 1 artículo original para esta replicación. Seleccione qué originales desea añadir a su biblioteca.
       *[other] Se encontraron { $count } artículos originales para esta replicación. Seleccione qué originales desea añadir a su biblioteca.
    }
replication-checker-add-original-select-btn = Seleccionar qué originales añadir
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] Se añadió 1 nuevo y se actualizó { $existingCount } estudio original existente en "{ $folderName }".
       *[other] Se añadieron { $newCount } nuevos y se actualizaron { $existingCount } estudios originales existentes en "{ $folderName }".
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] Se añadió exitosamente 1 estudio original a "{ $folderName }".
       *[other] Se añadieron exitosamente { $count } estudios originales a "{ $folderName }".
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 1 estudio original ya en su biblioteca — etiquetas, notas y relaciones actualizadas en "{ $folderName }".
       *[other] { $count } estudios originales ya en su biblioteca — etiquetas, notas y relaciones actualizadas en "{ $folderName }".
    }
replication-checker-error-title = Replication Checker - Error
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
    { $count ->
        [one] ¿Está seguro de que desea bloquear 1 replicación?
       *[other] ¿Está seguro de que desea bloquear { $count } replicaciones?
    }

    Estos elementos serán movidos a la papelera y no se añadirán de nuevo en futuras verificaciones.
replication-checker-ban-success =
    { $count ->
        [one] Se bloqueó exitosamente 1 replicación.
       *[other] Se bloquearon exitosamente { $count } replicaciones.
    }
replication-checker-alert-no-replications-selected = No se seleccionaron elementos de replicación.

## Dialog
replication-checker-dialog-title = Estudios de replicación encontrados
replication-checker-dialog-intro =
    Estudios de replicación encontrados para:
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] Se encontró 1 replicación:
       *[other] Se encontraron { $count } replicaciones:
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Resultado: { $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...y 1 replicación más
       *[other] ...y { $count } replicaciones más
    }
replication-checker-dialog-question = ¿Desea añadir información de replicación?
replication-checker-dialog-progress-title = Información de replicación añadida
replication-checker-dialog-progress-line = Información de replicación añadida a "{ $title }"
replication-checker-notif-replication-new =
    { $count ->
        [one] Se añadió exitosamente 1 nueva replicación a "{ $folderName }".
       *[other] Se añadieron exitosamente { $count } nuevas replicaciones a "{ $folderName }".
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 1 replicación ya en su biblioteca — etiquetas, notas y relaciones actualizadas en "{ $folderName }".
       *[other] { $count } replicaciones ya en su biblioteca — etiquetas, notas y relaciones actualizadas en "{ $folderName }".
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] Se añadió 1 nueva y se actualizó { $existingCount } replicación existente en "{ $folderName }".
       *[other] Se añadieron { $newCount } nuevas y se actualizaron { $existingCount } replicaciones existentes en "{ $folderName }".
    }
replication-checker-dialog-is-replication-title = Estudio original encontrado
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] No se encontraron replicaciones, pero esto parece ser un estudio de replicación. Se encontró 1 artículo original. ¿Desea añadirlo a su biblioteca?
       *[other] No se encontraron replicaciones, pero esto parece ser un estudio de replicación. Se encontraron { $count } artículos originales. ¿Desea seleccionar cuáles originales añadir a su biblioteca?
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Biblioteca de solo lectura detectada
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] Esta biblioteca es de solo lectura. Encontramos { $itemCount } elemento(s) con 1 replicación.
       *[other] Esta biblioteca es de solo lectura. Encontramos { $itemCount } elemento(s) con { $replicationCount } replicaciones.
    }

    ¿Desea copiar los artículos originales y sus replicaciones a la "carpeta de replicaciones" de su biblioteca personal?

## Results Messages
replication-checker-results-title-library = Análisis de biblioteca completo
replication-checker-results-title-selected = Análisis de elementos seleccionados completo
replication-checker-results-title-collection = Análisis de colección completo
replication-checker-results-total = Total de elementos verificados: { $count }
replication-checker-results-dois = Elementos con DOI: { $count }
replication-checker-results-found =
    { $count ->
        [one] 1 elemento tiene replicaciones, almacenado en "{ $folderName }".
       *[other] { $count } elementos tienen replicaciones, almacenados en "{ $folderName }".
    }
replication-checker-results-none = No se encontraron replicaciones.
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1 elemento tiene reproducciones, almacenado en "{ $folderName }".
       *[other] { $count } elementos tienen reproducciones, almacenados en "{ $folderName }".
    }
replication-checker-results-reproductions-none = No se encontraron reproducciones.
replication-checker-results-footer = Ver notas para detalles o seleccionar elementos para reverificar.

## Tags
replication-checker-tag = Ha sido replicado
replication-checker-tag-is-replication = Es una replicación
replication-checker-tag-added-by-checker = Añadido por Replication Checker
replication-checker-tag-success = Replicación: Exitosa
replication-checker-tag-failure = Replicación: Fallida
replication-checker-tag-mixed = Replicación: Mixta
replication-checker-tag-multiple-originals = Replicación: Múltiples originales
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
replication-checker-note-footer = Generado por Zotero Replication Checker usando la Base de datos de literatura FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Sin título disponible
replication-checker-li-no-authors = Sin autores disponibles
replication-checker-li-no-journal = Sin revista
replication-checker-li-na = N/D
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Resultado reportado por el autor:
replication-checker-li-link = Este estudio tiene un informe vinculado:

## First Run Prompt
replication-checker-prompt-title = ¡Bienvenido a Zotero Replication Checker!
replication-checker-prompt-first-run =
    ¡Gracias por instalar Zotero Replication Checker!

    Este complemento le ayuda a descubrir estudios de replicación para su investigación verificando los elementos de su biblioteca en la Base de datos de literatura FORRT (FLoRA).

    ¿Desea analizar su biblioteca en busca de replicaciones ahora?

    • Haga clic en "Aceptar" para comenzar el análisis (esto puede tardar unos minutos)
    • Haga clic en "Cancelar" para omitir - siempre puede analizar más tarde desde el menú Herramientas

## Onboarding
onboarding-welcome-title = ¡Bienvenido a Replication Checker!
onboarding-welcome-content =
    ¡Gracias por instalar Zotero Replication Checker!

    Este complemento le ayuda a descubrir estudios de replicación y reproducción verificando automáticamente los elementos de su biblioteca en la Base de datos de literatura FORRT (FLoRA).

    ✨ Características principales:
    • Verifica toda la biblioteca, colecciones o elementos individuales
    • Detecta tanto replicaciones como reproducciones computacionales
    • Gestiona artículos con múltiples estudios originales
    • Añade notas con etiquetas de resultado y enlaces DOI
    • Etiqueta elementos automáticamente (p. ej. «Tiene replicación», «Es replicación»)
    • Ofrece añadir el estudio original cuando se detecta una replicación
    • Soporte para bibliotecas de grupo de solo lectura — copia elementos a la biblioteca personal
    • Todas las colecciones dentro de una única colección «FLoRA», con nombres configurables
    • Bloquea replicaciones no deseadas de futuras verificaciones
    • Verificación automática: analiza nuevos elementos automáticamente o según un horario
    • Privacidad garantizada: sus DOIs nunca se envían al servidor
    • Disponible en varios idiomas

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

    🗂️ Dónde queda todo:
    Todo lo que crea el complemento vive dentro de una única colección «FLoRA»
    • FLoRA Replications, FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ Preferencias:
    Editar → Configuración → Replication Checker
    • Frecuencia de verificación automática
    • Verificación automática de nuevos elementos
    • Nombres de las colecciones, incluido el contenedor «FLoRA»
    • Estadísticas de FLoRA por biblioteca, con enlace al Replication Atlas

onboarding-stats-title = Sus estadísticas de FLoRA
onboarding-stats-content =
    📍 Ubicación: Editar → Configuración → Replication Checker

    📊 Recuentos en vivo de lo que FLoRA sabe sobre su biblioteca:
    • Artículos con replicaciones / reproducciones
    • Artículos que son en sí mismos replicaciones o reproducciones
    • Contados por DOI único: el mismo artículo guardado dos veces cuenta una vez

    📚 Bibliotecas de grupo:
    Si pertenece a alguna, aparece un selector de biblioteca sobre la tabla — las estadísticas corresponden a la biblioteca que elija, no solo a la personal.

    🌍 Abrir en FLoRA Atlas:
    Abre el Replication Atlas precargado con los DOI registrados de la biblioteca seleccionada, para ver cómo encajan sus lecturas en la literatura de replicación.

    💡 Los elementos sin un DOI utilizable no se pueden identificar, por lo que quedan excluidos — una nota bajo el botón indica cuántos.

onboarding-scan-title = ¿Listo para analizar su biblioteca?
onboarding-scan-content =
    ¿Desea analizar su biblioteca en busca de replicaciones ahora?

    • Haga clic en "Sí" para comenzar el análisis
      (esto puede tardar unos minutos)

    • Haga clic en "No" para omitir - siempre puede analizar más tarde desde el menú Herramientas

    💡 Acceda a esta guía en cualquier momento:
    Ayuda → Guía de usuario de Replication Checker

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Bloquear reproducción

## Reproduction Feature - Tags
reproduction-checker-tag = Ha sido reproducido
reproduction-checker-tag-is-reproduction = Es una reproducción
reproduction-checker-tag-added-by-checker = Añadido por Replication Checker
reproduction-checker-tag-readonly-origin = Original presente en biblioteca de solo lectura

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reproducción: Computacionalmente exitosa, Robusta
reproduction-checker-tag-outcome-cs-challenges = Reproducción: Computacionalmente exitosa, Desafíos de robustez
reproduction-checker-tag-outcome-cs-not-checked = Reproducción: Computacionalmente exitosa, Robustez no verificada
reproduction-checker-tag-outcome-ci-robust = Reproducción: Problemas computacionales, Robusta
reproduction-checker-tag-outcome-ci-challenges = Reproducción: Problemas computacionales, Desafíos de robustez
reproduction-checker-tag-outcome-ci-not-checked = Reproducción: Problemas computacionales, Robustez no verificada
reproduction-checker-tag-multiple-originals = Reproducción: Múltiples originales

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproducciones encontradas
reproduction-checker-note-warning = Esta nota es generada automáticamente. Si la edita, se creará una nueva nota en la próxima verificación y esta versión se conservará tal cual.
reproduction-checker-note-intro = Este estudio ha sido reproducido:
reproduction-checker-note-feedback = ¿Encontró útil este resultado? Proporcione comentarios <a href="{ $url }" target="_blank">aquí</a>!
reproduction-checker-note-data-issues = ¿Encontró algún problema en los datos? Por favor repórtelo <a href="{ $url }" target="_blank">aquí</a>!
reproduction-checker-note-footer = Generado por Zotero Replication Checker usando la Base de datos de literatura FORRT (FLoRA)

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
    { $count ->
        [one] ¿Está seguro de que desea bloquear 1 reproducción?
       *[other] ¿Está seguro de que desea bloquear { $count } reproducciones?
    }

    Estos elementos serán movidos a la papelera y no se añadirán de nuevo en futuras verificaciones.
reproduction-checker-ban-success =
    { $count ->
        [one] Se bloqueó exitosamente 1 reproducción.
       *[other] Se bloquearon exitosamente { $count } reproducciones.
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = Estudios relacionados encontrados
replication-checker-dialog-intro-studies =
    Estudios encontrados para:
    «{ $title }»
replication-checker-dialog-question-studies = ¿Desea añadir esta información a su biblioteca?
reproduction-checker-dialog-title = Estudios de reproducción encontrados
reproduction-checker-dialog-intro =
    Estudios de reproducción encontrados para:
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] Se encontró 1 reproducción:
       *[other] Se encontraron { $count } reproducciones:
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Resultado: { $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...y 1 reproducción más
       *[other] ...y { $count } reproducciones más
    }
reproduction-checker-dialog-question = ¿Desea añadir información en el/los estudio/s de reproducción encontrados?
reproduction-checker-dialog-progress-title = Información de reproducción añadida
reproduction-checker-dialog-progress-line = Información de reproducción añadida a "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] Se encontró 1 elemento con reproducciones
       *[other] Se encontraron { $count } elementos con reproducciones
    }

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
pref-folder-title = Nombre de la carpeta de replicaciones
pref-folder-description = Nombre de la colección de Zotero donde se almacenan los elementos de replicación
pref-folder-hint = Al cambiar esto se renombrará automáticamente la colección existente. Todos los elementos permanecerán en la misma colección.
pref-repro-folder-title = Nombre de la carpeta de reproducciones
pref-repro-folder-description = Nombre de la colección de Zotero donde se almacenan los elementos de reproducción
pref-repro-folder-hint = Al cambiar esto se renombrará automáticamente la colección existente. Todos los elementos permanecerán en la misma colección.
pref-originals-replication-folder-title = Carpeta de originales (vinculada a replicaciones)
pref-originals-replication-folder-description = Nombre de la colección de Zotero donde se almacenan los artículos originales (cuyas replicaciones han sido añadidas)
pref-originals-replication-folder-hint = Al cambiar esto se renombrará automáticamente la colección existente. Todos los elementos permanecerán en la misma colección.
pref-originals-reproduction-folder-title = Carpeta de originales (vinculada a reproducciones)
pref-originals-reproduction-folder-description = Nombre de la colección de Zotero donde se almacenan los artículos originales (cuyas reproducciones han sido añadidas)
pref-originals-reproduction-folder-hint = Al cambiar esto se renombrará automáticamente la colección existente. Todos los elementos permanecerán en la misma colección.

## Stats Pane
pref-stats-title = Sus estadísticas de FLoRA
pref-stats-description = Estadísticas basadas en su biblioteca de Zotero actual
pref-stats-has-replication = Artículos con replicaciones
pref-stats-has-reproduction = Artículos con reproducciones
pref-stats-is-replication = Artículos identificados como replicaciones
pref-stats-originals = Artículos originales rastreados
pref-stats-refresh = Actualizar estadísticas
pref-stats-no-originals = No se encontraron artículos originales rastreados en su biblioteca. Ejecute primero una verificación de replicaciones.
pref-stats-open-atlas = Abrir en FLoRA Atlas ↗
pref-stats-view-flora = Ver base de datos FLoRA →

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
