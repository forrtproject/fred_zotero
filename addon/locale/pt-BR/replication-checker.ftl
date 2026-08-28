# Zotero Replication Checker Locale File - Portuguese Brazil (Português do Brasil)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Verificar replicações na biblioteca atual
replication-checker-context-menu = Verificar replicações
replication-checker-context-menu-ban = Banir replicação
replication-checker-context-menu-add-original = Adicionar original
replication-checker-context-menu-add-originals = Adicionar originais

## Progress Messages
replication-checker-progress-checking-library = Verificando replicações
replication-checker-progress-checking-collection = Verificando replicações na coleção
replication-checker-progress-scanning-library = Analisando biblioteca...
replication-checker-progress-scanning-collection = Analisando coleção...
replication-checker-progress-found-dois = { $itemCount } itens com DOIs encontrados ({ $uniqueCount } únicos)
replication-checker-progress-checking-database = Consultando banco de dados de replicações...
replication-checker-progress-no-dois = Nenhum item com DOI encontrado na coleção
replication-checker-progress-complete = Verificação concluída
replication-checker-progress-failed = Verificação falhou
replication-checker-progress-match-count =
    { $count ->
        [one] 1 item com replicações encontrado
       *[other] { $count } itens com replicações encontrados
    }
replication-checker-progress-copying-readonly = Copiando itens da biblioteca (somente leitura) para a biblioteca pessoal...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = Nenhum DOI encontrado nos itens selecionados.
replication-checker-alert-no-collection = Selecione uma coleção antes de executar esta verificação.
replication-checker-alert-no-originals-available = Nenhum estudo original disponível para esta replicação.
replication-checker-alert-no-doi = O item selecionado não possui DOI.
replication-checker-add-original-success = "{ $title }" adicionado com sucesso a "{ $folderName }".
replication-checker-add-original-exists = "{ $title }" já está em sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
replication-checker-add-original-add-all-btn = Adicionar todos os originais
replication-checker-add-original-confirm =
    { $count ->
        [one] Encontrado 1 artigo original para esta replicação. Selecione quais originais deseja adicionar à sua biblioteca.
       *[other] Encontrados { $count } artigos originais para esta replicação. Selecione quais originais deseja adicionar à sua biblioteca.
    }
replication-checker-add-original-select-btn = Selecionar quais originais adicionar
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] 1 novo e { $existingCount } estudo original existente atualizados em "{ $folderName }".
       *[other] { $newCount } novos e { $existingCount } estudos originais existentes atualizados em "{ $folderName }".
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] 1 estudo original adicionado com sucesso a "{ $folderName }".
       *[other] { $count } estudos originais adicionados com sucesso a "{ $folderName }".
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 1 estudo original já em sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
       *[other] { $count } estudos originais já em sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
    }
replication-checker-error-title = Replication Checker - Erro
replication-checker-error-api = Não foi possível recuperar dados da API - verifique sua conexão com a Internet ou tente novamente mais tarde.
replication-checker-error-body =
    Falha ao verificar { $target } para replicações:

    { $details }

    Não foi possível recuperar dados da API - verifique sua conexão com a Internet ou tente novamente mais tarde.
replication-checker-target-library = a biblioteca atual
replication-checker-target-selected = os itens selecionados
replication-checker-target-collection = a coleção selecionada

## Ban Feature
replication-checker-ban-title = Banir replicações
replication-checker-ban-confirm =
    { $count ->
        [one] Tem certeza de que deseja banir 1 replicação?
       *[other] Tem certeza de que deseja banir { $count } replicações?
    }

    Estes itens serão movidos para a lixeira e não serão readicionados em verificações futuras.
replication-checker-ban-success =
    { $count ->
        [one] 1 replicação banida com sucesso.
       *[other] { $count } replicações banidas com sucesso.
    }
replication-checker-alert-no-replications-selected = Nenhum item de replicação selecionado.

## Dialog
replication-checker-dialog-title = Estudos de Replicação Encontrados
replication-checker-dialog-intro =
    Estudos de replicação encontrados para:
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] 1 replicação encontrada:
       *[other] { $count } replicações encontradas:
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
replication-checker-dialog-question = Deseja adicionar informações de replicação?
replication-checker-dialog-progress-title = Informações de Replicação Adicionadas
replication-checker-dialog-progress-line = Informações de replicação adicionadas a "{ $title }"
replication-checker-notif-replication-new =
    { $count ->
        [one] 1 nova replicação adicionada com sucesso a "{ $folderName }".
       *[other] { $count } novas replicações adicionadas com sucesso a "{ $folderName }".
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 1 replicação já em sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
       *[other] { $count } replicações já em sua biblioteca — etiquetas, notas e relações atualizadas em "{ $folderName }".
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] 1 nova e { $existingCount } replicação existente atualizadas em "{ $folderName }".
       *[other] { $newCount } novas e { $existingCount } replicações existentes atualizadas em "{ $folderName }".
    }
replication-checker-dialog-is-replication-title = Estudo Original Encontrado
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] Nenhuma replicação encontrada, mas este parece ser um estudo de replicação. 1 artigo original encontrado. Deseja adicioná-lo à sua biblioteca?
       *[other] Nenhuma replicação encontrada, mas este parece ser um estudo de replicação. { $count } artigos originais encontrados. Selecione quais originais deseja adicionar à sua biblioteca.
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Biblioteca detectada (somente leitura)
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] Esta biblioteca tem acesso somente leitura. Encontramos { $itemCount } item(ns) com 1 replicação.
       *[other] Esta biblioteca tem acesso somente leitura. Encontramos { $itemCount } item(ns) com { $replicationCount } replicações.
    }

    Deseja copiar os artigos originais e suas replicações para a "pasta de replicações" da sua biblioteca pessoal?

## Results Messages
replication-checker-results-title-library = Análise da Biblioteca Concluída
replication-checker-results-title-selected = Análise dos Itens Selecionados Concluída
replication-checker-results-title-collection = Análise da Coleção Concluída
replication-checker-results-total = Total de itens verificados: { $count }
replication-checker-results-dois = Itens com DOIs: { $count }
replication-checker-results-found =
    { $count ->
        [one] 1 item tem replicações, armazenado em "{ $folderName }".
       *[other] { $count } itens têm replicações, armazenados em "{ $folderName }".
    }
replication-checker-results-none = Nenhuma replicação encontrada.
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1 item tem reproduções, armazenado em "{ $folderName }".
       *[other] { $count } itens têm reproduções, armazenados em "{ $folderName }".
    }
replication-checker-results-reproductions-none = Nenhuma reprodução encontrada.
replication-checker-results-footer = Veja as notas para detalhes ou selecione itens para reverificar.

## Tags
replication-checker-tag = Foi Replicado
replication-checker-tag-is-replication = É uma Replicação
replication-checker-tag-added-by-checker = Adicionado pelo Replication Checker
replication-checker-tag-success = Replicação: Bem-sucedida
replication-checker-tag-failure = Replicação: Falhou
replication-checker-tag-mixed = Replicação: Mista
replication-checker-tag-multiple-originals = Replicação: Múltiplos originais
replication-checker-tag-readonly-origin = Original presente em biblioteca (somente leitura)
replication-checker-tag-has-been-replicated = Foi Replicado
replication-checker-tag-has-been-reproduced = Foi Reproduzido
replication-checker-tag-in-flora = Em FLoRA

## Note Template
replication-checker-note-title = Replicações Encontradas
replication-checker-note-warning = Esta nota é gerada automaticamente. Se você editá-la, uma nova nota será criada na próxima verificação e esta versão será mantida como está.
replication-checker-note-intro = Este estudo foi replicado:
replication-checker-note-feedback = Achou este resultado útil? Forneça feedback <a href="{ $url }" target="_blank">aqui</a>!
replication-checker-note-data-issues = Encontrou algum problema nos dados? Por favor, reporte-o <a href="{ $url }" target="_blank">aqui</a>!
replication-checker-note-footer = Gerado pelo Zotero Replication Checker usando a Base de Dados de Literatura FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Nenhum título disponível
replication-checker-li-no-authors = Nenhum autor disponível
replication-checker-li-no-journal = Sem revista
replication-checker-li-na = N/D
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Resultado Relatado pelo Autor:
replication-checker-li-link = Este estudo tem um relatório vinculado:

## First Run Prompt
replication-checker-prompt-title = Bem-vindo ao Zotero Replication Checker!
replication-checker-prompt-first-run =
    Obrigado por instalar o Zotero Replication Checker!

    Este plugin ajuda você a descobrir estudos de replicação para sua pesquisa verificando os itens da sua biblioteca na Base de Dados de Literatura FORRT (FLoRA).

    Deseja analisar sua biblioteca em busca de replicações agora?

    • Clique em "OK" para iniciar a análise (isso pode levar alguns minutos)
    • Clique em "Cancelar" para pular - você sempre pode analisar mais tarde pelo menu Ferramentas

## Onboarding
onboarding-welcome-title = Bem-vindo ao Replication Checker!
onboarding-welcome-content =
    Obrigado por instalar o Zotero Replication Checker!

    Este plugin ajuda você a descobrir estudos de replicação e reprodução verificando automaticamente os itens da sua biblioteca na Base de Dados de Literatura FORRT (FLoRA).

    ✨ Recursos principais:
    • Verifica toda a biblioteca, coleções ou itens individuais
    • Detecta tanto replicações quanto reproduções computacionais
    • Gerencia artigos com múltiplos estudos originais
    • Adiciona notas com etiquetas de resultado e links DOI
    • Etiqueta itens automaticamente (ex. «Tem replicação», «É replicação»)
    • Oferece adicionar o estudo original quando uma replicação é detectada
    • Suporte para bibliotecas de grupo somente leitura — copia itens para a biblioteca pessoal
    • Todas as coleções dentro de uma única coleção «FLoRA», com nomes configuráveis
    • Bane replicações indesejadas em verificações futuras
    • Verificação automática: analisa novos itens automaticamente ou conforme agendamento
    • Preservação de privacidade: seus DOIs nunca são enviados ao servidor
    • Disponível em vários idiomas

    Vamos fazer um tour rápido para começar!

onboarding-tools-title = Verificar toda a sua biblioteca
onboarding-tools-content =
    📍 Local: Ferramentas → Verificar biblioteca atual para replicações

    🔍 O que faz:
    • Analisa todos os itens com DOIs
    • Consulta o banco de dados FLoRA
    • Cria notas com detalhes
    • Marca itens por resultado

    💡 Dica: Leva alguns minutos dependendo do tamanho da biblioteca.

onboarding-context-title = Verificar coleções e itens
onboarding-context-content =
    📚 Para coleções:
    Clique com o botão direito na coleção → Verificar replicações

    📄 Para itens individuais:
    Clique com o botão direito nos itens → Verificar replicações

    🚫 Banir replicações:
    Clique com o botão direito nos itens de replicação → Banir replicação
    • Impede que replicações indesejadas sejam readicionadas

    🗂️ Onde tudo fica:
    Tudo o que o plugin cria fica dentro de uma única coleção «FLoRA»
    • FLoRA Replications, FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ Preferências:
    Editar → Configurações → Replication Checker
    • Frequência de verificação automática
    • Verificação automática de novos itens
    • Nomes das coleções, incluindo o contêiner «FLoRA»
    • Estatísticas do FLoRA por biblioteca, com link para o Replication Atlas

onboarding-stats-title = Suas estatísticas do FLoRA
onboarding-stats-content =
    📍 Local: Editar → Configurações → Replication Checker

    📊 Contagens ao vivo do que o FLoRA sabe sobre sua biblioteca:
    • Artigos com replicações / reproduções
    • Artigos que são eles próprios replicações ou reproduções
    • Contados por DOI único: o mesmo artigo salvo duas vezes conta uma vez

    📚 Bibliotecas de grupo:
    Se você participa de alguma, aparece um seletor de biblioteca acima da tabela — as estatísticas referem-se à biblioteca escolhida, não apenas à pessoal.

    🌍 Abrir no FLoRA Atlas:
    Abre o Replication Atlas pré-carregado com os DOIs monitorados da biblioteca selecionada, para ver como suas leituras se situam na literatura de replicação.

    💡 Itens sem um DOI utilizável não podem ser identificados e por isso ficam de fora — uma nota abaixo do botão informa quantos.

onboarding-scan-title = Pronto para analisar sua biblioteca?
onboarding-scan-content =
    Deseja analisar sua biblioteca em busca de replicações agora?

    • Clique em "Sim" para iniciar a análise
      (isso pode levar alguns minutos)

    • Clique em "Não" para pular - você sempre pode analisar mais tarde pelo menu Ferramentas

    💡 Acesse este guia a qualquer momento:
    Ajuda → Guia do Usuário do Replication Checker

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Banir reprodução

## Reproduction Feature - Tags
reproduction-checker-tag = Foi Reproduzido
reproduction-checker-tag-is-reproduction = É uma Reprodução
reproduction-checker-tag-added-by-checker = Adicionado pelo Replication Checker
reproduction-checker-tag-readonly-origin = Original presente em biblioteca (somente leitura)

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reprodução: Computacionalmente bem-sucedida, Robusta
reproduction-checker-tag-outcome-cs-challenges = Reprodução: Computacionalmente bem-sucedida, Desafios de robustez
reproduction-checker-tag-outcome-cs-not-checked = Reprodução: Computacionalmente bem-sucedida, Robustez não verificada
reproduction-checker-tag-outcome-ci-robust = Reprodução: Problemas computacionais, Robusta
reproduction-checker-tag-outcome-ci-challenges = Reprodução: Problemas computacionais, Desafios de robustez
reproduction-checker-tag-outcome-ci-not-checked = Reprodução: Problemas computacionais, Robustez não verificada
reproduction-checker-tag-multiple-originals = Reprodução: Múltiplos originais

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproduções Encontradas
reproduction-checker-note-warning = Esta nota é gerada automaticamente. Se você editá-la, uma nova nota será criada na próxima verificação e esta versão será mantida como está.
reproduction-checker-note-intro = Este estudo foi reproduzido:
reproduction-checker-note-feedback = Achou este resultado útil? Forneça feedback <a href="{ $url }" target="_blank">aqui</a>!
reproduction-checker-note-data-issues = Encontrou algum problema nos dados? Por favor, reporte-o <a href="{ $url }" target="_blank">aqui</a>!
reproduction-checker-note-footer = Gerado pelo Zotero Replication Checker usando a Base de Dados de Literatura FORRT (FLoRA)

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = Nenhum título disponível
reproduction-checker-li-no-authors = Nenhum autor disponível
reproduction-checker-li-no-journal = Sem revista
reproduction-checker-li-na = N/D
reproduction-checker-li-doi-label = DOI:
reproduction-checker-li-outcome = Resultado da Reprodução:
reproduction-checker-li-link = Este estudo tem um relatório vinculado:

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = Nenhum item de reprodução selecionado.
reproduction-checker-ban-title = Banir reproduções
reproduction-checker-ban-confirm =
    { $count ->
        [one] Tem certeza de que deseja banir 1 reprodução?
       *[other] Tem certeza de que deseja banir { $count } reproduções?
    }

    Estes itens serão movidos para a lixeira e não serão readicionados em verificações futuras.
reproduction-checker-ban-success =
    { $count ->
        [one] 1 reprodução banida com sucesso.
       *[other] { $count } reproduções banidas com sucesso.
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = Estudos relacionados encontrados
replication-checker-dialog-intro-studies =
    Estudos encontrados para:
    «{ $title }»
replication-checker-dialog-question-studies = Deseja adicionar estas informações à sua biblioteca?
reproduction-checker-dialog-title = Estudos de Reprodução Encontrados
reproduction-checker-dialog-intro =
    Estudos de reprodução encontrados para:
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] 1 reprodução encontrada:
       *[other] { $count } reproduções encontradas:
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
reproduction-checker-dialog-question = Deseja adicionar informações de reprodução?
reproduction-checker-dialog-progress-title = Informações de Reprodução Adicionadas
reproduction-checker-dialog-progress-line = Informações de reprodução adicionadas a "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] 1 item com reproduções encontrado
       *[other] { $count } itens com reproduções encontrados
    }

## Preference Pane
pref-autocheck-title = Verificação Automática da Biblioteca para Replicações
pref-autocheck-description = Verificar automaticamente estudos de replicação em sua biblioteca em intervalos regulares
pref-autocheck-disabled = Desativado (somente verificação manual)
pref-autocheck-daily = Diário (verificar a cada 24 horas)
pref-autocheck-weekly = Semanal (verificar a cada 7 dias)
pref-autocheck-monthly = Mensal (verificar a cada 30 dias)
pref-autocheck-new-items = Verificar automaticamente novos itens adicionados à biblioteca (recomendado)
pref-autocheck-new-items-hint = Desative esta opção se preferir executar todas as verificações de replicação manualmente.
pref-autocheck-note = A verificação automática é executada em segundo plano quando o Zotero está aberto. Você ainda pode verificar manualmente pelo menu Ferramentas.
pref-folder-title = Nome da Pasta de Replicações
pref-folder-description = Nome da coleção do Zotero onde os itens de replicação são armazenados
pref-folder-hint = Alterar isso renomeará automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.
pref-repro-folder-title = Nome da Pasta de Reproduções
pref-repro-folder-description = Nome da coleção do Zotero onde os itens de reprodução são armazenados
pref-repro-folder-hint = Alterar isso renomeará automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.
pref-originals-replication-folder-title = Pasta de Originais (vinculada a replicações)
pref-originals-replication-folder-description = Nome da coleção do Zotero onde os artigos originais (cujas replicações foram adicionadas) são armazenados
pref-originals-replication-folder-hint = Alterar isso renomeará automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.
pref-originals-reproduction-folder-title = Pasta de Originais (vinculada a reproduções)
pref-originals-reproduction-folder-description = Nome da coleção do Zotero onde os artigos originais (cujas reproduções foram adicionadas) são armazenados
pref-originals-reproduction-folder-hint = Alterar isso renomeará automaticamente a coleção existente. Todos os itens permanecerão na mesma coleção.

## Stats Pane
pref-stats-title = Suas Estatísticas do FLoRA
pref-stats-description = Estatísticas baseadas em sua biblioteca do Zotero atual
pref-stats-has-replication = Artigos com replicações
pref-stats-has-reproduction = Artigos com reproduções
pref-stats-is-replication = Artigos identificados como replicações
pref-stats-originals = Artigos originais rastreados
pref-stats-refresh = Atualizar Estatísticas
pref-stats-no-originals = Nenhum artigo original rastreado encontrado em sua biblioteca. Execute primeiro uma verificação de replicações.
pref-stats-open-atlas = Abrir no FLoRA Atlas ↗
pref-stats-view-flora = Ver Base de Dados FLoRA →

pref-blacklist-title = Replicações Banidas
pref-blacklist-description = Gerenciar a exibição de replicações banidas na sua biblioteca
pref-blacklist-col-replication = Artigo de Replicação
pref-blacklist-col-original = Artigo Original
pref-blacklist-col-type = Tipo
pref-blacklist-col-banned = Banido em
pref-blacklist-empty = Nenhuma replicação banida
pref-blacklist-remove = Remover selecionado
pref-blacklist-clear = Limpar todas as replicações banidas
pref-blacklist-hint = Replicações banidas não serão readicionadas em verificações futuras. Você pode banir replicações usando o menu de contexto.
