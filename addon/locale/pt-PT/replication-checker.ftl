# Zotero Replication Checker Locale File - European Portuguese (Português Europeu, Portugal)
# Modern Fluent format (.ftl)

## Menu Items / Itens do menu
replication-checker-tools-menu = Verificar replicações na biblioteca atual
replication-checker-context-menu = Verificar replicações
replication-checker-context-menu-ban = Excluir replicação
replication-checker-context-menu-add-original = Adicionar original
replication-checker-context-menu-add-originals = Adicionar originais

## Progress Messages / Mensagens de progresso
replication-checker-progress-checking-library = A verificar replicações
replication-checker-progress-checking-collection = A verificar replicações na coleção
replication-checker-progress-scanning-library = A analisar a biblioteca...
replication-checker-progress-scanning-collection = A analisar a coleção...
replication-checker-progress-found-dois = Encontrados { $itemCount } itens com DOI ({ $uniqueCount } únicos)
replication-checker-progress-checking-database = A verificar na base de dados de replicações...
replication-checker-progress-no-dois = Não foram encontrados itens com DOI na coleção
replication-checker-progress-complete = Verificação concluída
replication-checker-progress-failed = Falha na verificação
replication-checker-progress-match-count =
    { $count ->
        [one] Encontrado 1 item com replicações
       *[other] Encontrados { $count } itens com replicações
    }
replication-checker-progress-copying-readonly = A copiar itens da biblioteca só de leitura para a biblioteca pessoal...

## Alerts / Alertas
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = Não foram encontrados DOIs nos itens selecionados.
replication-checker-alert-no-collection = Selecione uma coleção antes de executar esta verificação.
replication-checker-alert-no-originals-available = Não há estudos originais disponíveis para esta replicação.
replication-checker-alert-no-doi = O item selecionado não tem DOI.
replication-checker-add-original-success = "{ $title }" adicionado com sucesso a "{ $folderName }".
replication-checker-add-original-exists = "{ $title }" já está na sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
replication-checker-add-original-add-all-btn = Adicionar todos os originais
replication-checker-add-original-confirm =
    { $count ->
        [one] Foi encontrado 1 artigo original para esta replicação. Selecione quais originais pretende adicionar à sua biblioteca.
       *[other] Foram encontrados { $count } artigos originais para esta replicação. Selecione quais originais pretende adicionar à sua biblioteca.
    }
replication-checker-add-original-select-btn = Selecionar quais originais adicionar
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] Adicionado 1 novo e atualizado { $existingCount } estudo original existente em "{ $folderName }".
       *[other] Adicionados { $newCount } novos e atualizados { $existingCount } estudos originais existentes em "{ $folderName }".
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] Foi adicionado com sucesso 1 estudo original a "{ $folderName }".
       *[other] Foram adicionados com sucesso { $count } estudos originais a "{ $folderName }".
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 1 estudo original já na sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
       *[other] { $count } estudos originais já na sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
    }
replication-checker-error-title = Replication Checker - Erro
replication-checker-error-api = Não foi possível obter dados da API - verifique a sua ligação à Internet ou tente novamente mais tarde.
replication-checker-error-body =
    Falha ao verificar { $target } quanto a replicações:

    { $details }

    Não foi possível obter dados da API - verifique a sua ligação à Internet ou tente novamente mais tarde.
replication-checker-target-library = a biblioteca atual
replication-checker-target-selected = os itens selecionados
replication-checker-target-collection = a coleção selecionada

## Ban Feature / Exclusão
replication-checker-ban-title = Excluir replicações
replication-checker-ban-confirm =
    { $count ->
        [one] Tem a certeza de que pretende excluir 1 replicação?
       *[other] Tem a certeza de que pretende excluir { $count } replicações?
    }

    Estes itens serão movidos para o lixo e não voltarão a ser adicionados em verificações futuras.

replication-checker-ban-success =
    { $count ->
        [one] 1 replicação excluída com sucesso.
       *[other] { $count } replicações excluídas com sucesso.
    }
replication-checker-alert-no-replications-selected = Não foram selecionados itens de replicação.


## Dialog
replication-checker-dialog-title = Estudos de replicação encontrados
replication-checker-dialog-intro =
    Estudos de replicação encontrados para:
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] Encontrada 1 replicação:
       *[other] Encontradas { $count } replicações:
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Resultado: { $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...e mais 1 replicação
       *[other] ...e mais { $count } replicações
    }
replication-checker-dialog-question = Pretende adicionar a informação sobre replicação?
replication-checker-dialog-progress-title = Informação de replicação adicionada
replication-checker-dialog-progress-line = Informação de replicação adicionada a "{ $title }"
replication-checker-notif-replication-new =
    { $count ->
        [one] 1 nova replicação adicionada com sucesso a "{ $folderName }".
       *[other] { $count } novas replicações adicionadas com sucesso a "{ $folderName }".
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 1 replicação já na sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
       *[other] { $count } replicações já na sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] Adicionada 1 nova e atualizada { $existingCount } replicação existente em "{ $folderName }".
       *[other] Adicionadas { $newCount } novas e atualizadas { $existingCount } replicações existentes em "{ $folderName }".
    }
replication-checker-dialog-is-replication-title = Estudo original encontrado
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] Não foram encontradas replicações, mas este parece ser um estudo de replicação. Foi encontrado 1 artigo original. Pretende adicioná-lo à sua biblioteca?
       *[other] Não foram encontradas replicações, mas este parece ser um estudo de replicação. Foram encontrados { $count } artigos originais. Selecione quais originais pretende adicionar à sua biblioteca.
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Biblioteca só de leitura detetada
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] Esta biblioteca é só de leitura. Foram encontrados { $itemCount } item(ns) com 1 replicação.
       *[other] Esta biblioteca é só de leitura. Foram encontrados { $itemCount } item(ns) com { $replicationCount } replicações.
    }

    Pretende copiar os artigos originais e as respetivas replicações para a pasta de replicações da sua biblioteca pessoal?

## Results Messages / Mensagens de Resultado
replication-checker-results-title-library = Análise da biblioteca concluída
replication-checker-results-title-selected = Análise dos itens selecionados concluída
replication-checker-results-title-collection = Análise da coleção concluída
replication-checker-results-total = Total de itens verificados: { $count }
replication-checker-results-dois = Itens com DOI: { $count }
replication-checker-results-found =
    { $count ->
        [one] 1 item com replicações, armazenado em "{ $folderName }".
       *[other] { $count } itens com replicações, armazenados em "{ $folderName }".
    }
replication-checker-results-none = Nenhuma replicação encontrada.
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1 item com reproduções, armazenado em "{ $folderName }".
       *[other] { $count } itens com reproduções, armazenados em "{ $folderName }".
    }
replication-checker-results-reproductions-none = Não foram encontradas reproduções.
replication-checker-results-footer = Consulte as notas para mais detalhes ou selecione itens para nova verificação.

## Tags
replication-checker-tag = Foi replicado
replication-checker-tag-is-replication = É replicação
replication-checker-tag-added-by-checker = Adicionado pelo Replication Checker
replication-checker-tag-success = Replicação: Bem-sucedida
replication-checker-tag-failure = Replicação: Falhou
replication-checker-tag-mixed = Replicação: Mista
replication-checker-tag-multiple-originals = Replicação: Múltiplos originais
replication-checker-tag-readonly-origin = Original presente em biblioteca só de leitura
replication-checker-tag-has-been-replicated = Foi replicado
replication-checker-tag-has-been-reproduced = Foi reproduzido
replication-checker-tag-in-flora = Em FLoRA

## Note Template
replication-checker-note-title = Replicações encontradas
replication-checker-note-warning = Esta nota é gerada automaticamente. Se a editar, será criada uma nova nota na próxima verificação e esta versão será mantida tal como está.
replication-checker-note-intro = Este estudo foi replicado:
replication-checker-note-feedback = Este resultado foi útil? Envie o seu feedback <a href="{ $url }" target="_blank">aqui</a>!
replication-checker-note-data-issues = Encontrou algum problema nos dados? Por favor, reporte-o <a href="{ $url }" target="_blank">aqui</a>!
replication-checker-note-footer = Gerado pelo Zotero Replication Checker com base na FORRT Literature Database (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Sem título disponível
replication-checker-li-no-authors = Sem autores disponíveis
replication-checker-li-no-journal = Sem revista
replication-checker-li-na = N/A
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Resultado reportado pelos autores:
replication-checker-li-link = Este estudo tem um relatório associado:

## First Run Prompt
replication-checker-prompt-title = Boas-vindas ao Zotero Replication Checker!
replication-checker-prompt-first-run =
   Obrigado por instalar o Zotero Replication Checker!

   Este plugin ajuda a encontrar estudos de replicação para a sua investigação, ao verificar os itens da sua biblioteca na FORRT Literature Database (FLoRA).

   Pretende analisar agora a sua biblioteca para procurar replicações?

    • Clique em "OK" para iniciar a análise (pode demorar alguns minutos)
    • Clique em "Cancel" para ignorar por agora - poderá sempre analisar mais tarde a partir do menu Ferramentas.

## Onboarding
onboarding-welcome-title = Boas-vindas ao Zotero Replication Checker!
onboarding-welcome-content =
    Obrigado por instalar o Zotero Replication Checker!

    Este plugin ajuda a encontrar estudos de replicação para a sua investigação, ao verificar os itens da sua biblioteca na FORRT Literature Database (FLoRA).

    ✨ Funcionalidades principais:
    • Verifica a biblioteca inteira, coleções ou itens individuais
    • Deteta tanto replicações como reproduções computacionais
    • Gere artigos com múltiplos estudos originais
    • Adiciona notas com etiquetas de resultado e ligações DOI
    • Etiqueta itens automaticamente (ex. «Tem replicação», «É replicação»)
    • Oferece adicionar o estudo original quando é detetada uma replicação
    • Suporte para bibliotecas de grupo só de leitura — copia itens para a biblioteca pessoal
    • Todas as coleções dentro de uma única coleção «FLoRA», com nomes configuráveis
    • Exclui replicações indesejadas de verificações futuras
    • Verificação automática: analisa novos itens automaticamente ou segundo um calendário
    • Privacidade garantida: os seus DOIs nunca são enviados ao servidor
    • Disponível em vários idiomas

    Vamos fazer uma visita rápida para começar!

onboarding-tools-title = Verifique toda a sua biblioteca
onboarding-tools-content =
    📍 Localização: Ferramentas → Verificar replicações na biblioteca atual

    🔍 O que faz:
    • Analisa todos os itens com DOI
    • Consulta a base de dados FLoRA
    • Cria notas com detalhes
    • Atribui etiquetas aos itens de acordo com o resultado

    💡 Sugestão: Pode demorar alguns minutos, dependendo do tamanho da biblioteca.

onboarding-context-title = Verifique coleções e itens
onboarding-context-content =
    📚 Para coleções:
    Clique com o botão direito na coleção → Verificar replicações

    📄 Para itens individuais:
    Clique com o botão direito nos itens → Verificar replicações

    🚫 Excluir replicações:
    Clique com o botão direito nos itens de replicação → Excluir replicação
    • Impede que replicações indesejadas voltem a ser adicionadas

    🗂️ Onde tudo fica:
    Tudo o que a extensão cria fica dentro de uma única coleção «FLoRA»
    • FLoRA Replications, FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ Preferências:
    Editar → Configurações → Zotero Replication Checker
    • Frequência de verificação automática
    • Verificação automática de novos itens
    • Nomes das coleções, incluindo o contentor «FLoRA»
    • Estatísticas do FLoRA por biblioteca, com ligação para o Replication Atlas

onboarding-stats-title = As suas estatísticas do FLoRA
onboarding-stats-content =
    📍 Localização: Editar → Configurações → Zotero Replication Checker

    📊 Contagens em direto do que o FLoRA sabe sobre a sua biblioteca:
    • Artigos com replicações / reproduções
    • Artigos que são eles próprios replicações ou reproduções
    • Contados por DOI único: o mesmo artigo guardado duas vezes conta uma vez

    📚 Bibliotecas de grupo:
    Se pertence a alguma, surge um seletor de biblioteca por cima da tabela — as estatísticas dizem respeito à biblioteca escolhida, não apenas à pessoal.

    🌍 Abrir no FLoRA Atlas:
    Abre o Replication Atlas pré-carregado com os DOI seguidos da biblioteca selecionada, para ver como as suas leituras se situam na literatura de replicação.

    💡 Os itens sem um DOI utilizável não podem ser identificados e por isso ficam de fora — uma nota por baixo do botão indica quantos.

onboarding-scan-title = Pretende analisar a sua biblioteca?
onboarding-scan-content =
    Pretende analisar agora a sua biblioteca para procurar replicações?

    • Clique em "Sim" para iniciar a análise
      (isto pode demorar alguns minutos)

    • Clique em "Não" para ignorar por agora - poderá analisar mais tarde a partir do menu Ferramentas.


    💡 Pode aceder a este guia a qualquer momento:
    Ajuda → Guia do Utilizador do Replication Checker

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Excluir reprodução

## Reproduction Feature - Tags
reproduction-checker-tag = Foi reproduzido
reproduction-checker-tag-is-reproduction = É reprodução
reproduction-checker-tag-added-by-checker = Adicionado pelo Replication Checker
reproduction-checker-tag-readonly-origin = Original presente em biblioteca só de leitura

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reprodução: Execução computacional bem-sucedida, robusta
reproduction-checker-tag-outcome-cs-challenges = Reprodução: Execução computacional bem-sucedida, com desafios de robustez
reproduction-checker-tag-outcome-cs-not-checked = Reprodução: Execução computacional bem-sucedida, robustez não verificada
reproduction-checker-tag-outcome-ci-robust = Reprodução: Problemas computacionais, robusta
reproduction-checker-tag-outcome-ci-challenges = Reprodução: Problemas computacionais, com desafios de robustez
reproduction-checker-tag-outcome-ci-not-checked = Reprodução: Problemas computacionais, robustez não verificada
reproduction-checker-tag-multiple-originals = Reprodução: Múltiplos originais

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproduções encontradas
reproduction-checker-note-warning = Esta nota é gerada automaticamente. Se a editar, será criada uma nova nota na próxima verificação e esta versão será mantida tal como está.
reproduction-checker-note-intro = Este estudo foi reproduzido:
reproduction-checker-note-feedback = Este resultado foi útil? Envie o seu feedback <a href="{ $url }" target="_blank">aqui</a>!
reproduction-checker-note-data-issues = Encontrou algum problema nos dados? Por favor, reporte-o <a href="{ $url }" target="_blank">aqui</a>!
reproduction-checker-note-footer = Gerado pelo Zotero Replication Checker com base na FORRT Literature Database (FLoRA)

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = Sem título disponível
reproduction-checker-li-no-authors = Sem autores disponíveis
reproduction-checker-li-no-journal = Sem revista
reproduction-checker-li-na = N/A
reproduction-checker-li-doi-label = DOI:
reproduction-checker-li-outcome = Resultado da reprodução:
reproduction-checker-li-link = Este estudo tem um relatório associado:

## Reproduction Feature - Alerts / Alertas
reproduction-checker-alert-no-reproductions-selected = Não foram selecionados itens de reprodução.
reproduction-checker-ban-title = Excluir reproduções
reproduction-checker-ban-confirm =
    { $count ->
        [one] Tem a certeza de que pretende excluir 1 reprodução?
       *[other] Tem a certeza de que pretende excluir { $count } reproduções?
    }

    Estes itens serão movidos para o lixo e não voltarão a ser adicionados em verificações futuras.

reproduction-checker-ban-success =
    { $count ->
        [one] 1 reprodução excluída com sucesso.
       *[other] { $count } reproduções excluídas com sucesso.
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = Estudos relacionados encontrados
replication-checker-dialog-intro-studies =
    Estudos encontrados para:
    «{ $title }»
replication-checker-dialog-question-studies = Pretende adicionar estas informações à sua biblioteca?
reproduction-checker-dialog-title = Estudos de reprodução encontrados
reproduction-checker-dialog-intro =
    Estudos de reprodução encontrados para:
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] Encontrada 1 reprodução:
       *[other] Encontradas { $count } reproduções:
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Resultado: { $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...e mais 1 reprodução
       *[other] ...e mais { $count } reproduções
    }
reproduction-checker-dialog-question = Pretende adicionar informação sobre reprodução?
reproduction-checker-dialog-progress-title = Informação de reprodução adicionada
reproduction-checker-dialog-progress-line = Informação de reprodução adicionada a "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] Encontrado 1 item com reproduções
       *[other] Encontrados { $count } itens com reproduções
    }

## Preference Pane
pref-autocheck-title = Verificar automaticamente a biblioteca para replicações
pref-autocheck-description = Verifica automaticamente a sua biblioteca quanto a estudos de replicação em intervalos regulares
pref-autocheck-disabled = Desativado (apenas verificação manual)
pref-autocheck-daily = Diária (verificação a cada 24 horas)
pref-autocheck-weekly = Semanal (verificação a cada 7 dias)
pref-autocheck-monthly = Mensal (verificar a cada 30 dias)
pref-autocheck-new-items = Verificar automaticamente novos itens adicionados à biblioteca (recomendado)
pref-autocheck-new-items-hint = Desative esta opção se preferir executar manualmente todas as verificações de replicação.
pref-autocheck-note = A verificação automática decorre em segundo plano quando o Zotero está aberto. Continua a poder verificar manualmente através do menu Ferramentas.
pref-folder-title = Nome da pasta de replicações
pref-folder-description = Nome da coleção do Zotero onde os itens de replicação são armazenados
pref-folder-hint = Alterar isto irá renomear automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.
pref-repro-folder-title = Nome da pasta de reproduções
pref-repro-folder-description = Nome da coleção do Zotero onde os itens de reprodução são armazenados
pref-repro-folder-hint = Alterar isto irá renomear automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.
pref-originals-replication-folder-title = Pasta de originais (ligada a replicações)
pref-originals-replication-folder-description = Nome da coleção do Zotero onde os artigos originais (cujas replicações foram adicionadas) são armazenados
pref-originals-replication-folder-hint = Alterar isto irá renomear automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.
pref-originals-reproduction-folder-title = Pasta de originais (ligada a reproduções)
pref-originals-reproduction-folder-description = Nome da coleção do Zotero onde os artigos originais (cujas reproduções foram adicionadas) são armazenados
pref-originals-reproduction-folder-hint = Alterar isto irá renomear automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.

## Stats Pane
pref-stats-title = As suas estatísticas do FLoRA
pref-stats-description = Estatísticas com base na sua biblioteca do Zotero atual
pref-stats-has-replication = Artigos com replicações
pref-stats-has-reproduction = Artigos com reproduções
pref-stats-is-replication = Artigos identificados como replicações
pref-stats-originals = Artigos originais monitorizados
pref-stats-refresh = Atualizar estatísticas
pref-stats-no-originals = Não foram encontrados artigos originais monitorizados na sua biblioteca. Execute primeiro uma verificação de replicações.
pref-stats-open-atlas = Abrir no FLoRA Atlas ↗
pref-stats-view-flora = Ver base de dados FLoRA →

##
pref-blacklist-title = Replicações excluídas
pref-blacklist-description = Gerir as replicações que excluiu para que não apareçam na sua biblioteca
pref-blacklist-col-replication = Artigo de replicação
pref-blacklist-col-original = Artigo original
pref-blacklist-col-type = Tipo
pref-blacklist-col-banned = Excluído em
pref-blacklist-empty = Não existem replicações excluídas
pref-blacklist-remove = Remover selecionado(s)
pref-blacklist-clear = Limpar todas as replicações excluídas
pref-blacklist-hint = As replicações excluídas não voltarão a ser adicionadas em verificações futuras. Pode excluir replicações através do menu contextual.
