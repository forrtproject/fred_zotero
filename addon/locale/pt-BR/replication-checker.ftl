# Zotero Replication Checker Locale File - Portuguese Brazil (Português do Brasil)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Verificar biblioteca atual para replicações
replication-checker-context-menu = Verificar replicações
replication-checker-context-menu-ban = Banir replicação
replication-checker-context-menu-add-original = Adicionar original

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
replication-checker-progress-match-count = { $count } item(ns) com replicações encontrado(s)
replication-checker-progress-copying-readonly = Copiando itens da biblioteca somente leitura para a biblioteca pessoal...

## Alerts
replication-checker-alert-title = Verificador de Replicações do Zotero
replication-checker-alert-no-dois-selected = Nenhum DOI encontrado nos itens selecionados.
replication-checker-alert-no-collection = Selecione uma coleção antes de executar esta verificação.
replication-checker-alert-no-originals-available = Nenhum estudo original disponível para esta replicação.
replication-checker-alert-no-doi = O item selecionado não possui DOI.
replication-checker-add-original-success = Estudo original adicionado com sucesso: { $title }
replication-checker-add-original-confirm = { $count } estudo(s) original(is) encontrado(s) para esta replicação. Deseja adicionar todos à sua biblioteca?
replication-checker-add-original-batch-success = { $count } estudo(s) original(is) adicionado(s) com sucesso à sua biblioteca.
replication-checker-error-title = Verificador de Replicações - Erro
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
    Tem certeza de que deseja banir { $count } replicação(ões)?

    Estes itens serão movidos para a lixeira e não serão readicionados em verificações futuras.
replication-checker-ban-success = { $count } replicação(ões) banida(s) com sucesso.
replication-checker-alert-no-replications-selected = Nenhum item de replicação selecionado.

## Dialog
replication-checker-dialog-title = Estudos de Replicação Encontrados
replication-checker-dialog-intro = Estudos de replicação encontrados para:\n"{ $title }"
replication-checker-dialog-count = { $count } replicação(ões) encontrada(s):
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Resultado: { $outcome }
replication-checker-dialog-more = ...e mais { $count } replicação(ões)
replication-checker-dialog-question = Deseja adicionar informações de replicação?
replication-checker-dialog-progress-title = Informações de Replicação Adicionadas
replication-checker-dialog-progress-line = Informações de replicação adicionadas a "{ $title }"
replication-checker-dialog-is-replication-title = Estudo Original Encontrado
replication-checker-dialog-is-replication-message = Nenhuma replicação encontrada, mas este parece ser um estudo de replicação.\n\nDeseja adicionar o(s) artigo(s) original(is)?

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Biblioteca Somente Leitura Detectada
replication-checker-readonly-dialog-message =
    Esta biblioteca é somente leitura. Encontramos { $itemCount } item(ns) com { $replicationCount } replicação(ões).

    Deseja copiar os artigos originais e suas replicações para a "pasta de replicações" da sua biblioteca pessoal?

## Results Messages
replication-checker-results-title-library = Análise da Biblioteca Concluída
replication-checker-results-title-selected = Análise dos Itens Selecionados Concluída
replication-checker-results-title-collection = Análise da Coleção Concluída
replication-checker-results-total = Total de itens verificados: { $count }
replication-checker-results-dois = Itens com DOIs: { $count }
replication-checker-results-found = { $count } item(ns) tem/têm replicações.
replication-checker-results-none = Nenhuma replicação encontrada.
replication-checker-results-reproductions-found = { $count } item(ns) tem/têm reproduções.
replication-checker-results-reproductions-none = Nenhuma reprodução encontrada.
replication-checker-results-footer = Veja as notas para detalhes ou selecione itens para reverificar.

## Tags
replication-checker-tag = Tem Replicação
replication-checker-tag-is-replication = É uma Replicação
replication-checker-tag-added-by-checker = Adicionado pelo Verificador de Replicações
replication-checker-tag-success = Replicação: Bem-sucedida
replication-checker-tag-failure = Replicação: Falhou
replication-checker-tag-mixed = Replicação: Mista
replication-checker-tag-readonly-origin = Original presente em biblioteca somente leitura
replication-checker-tag-has-been-replicated = Foi Replicado
replication-checker-tag-has-been-reproduced = Foi Reproduzido
replication-checker-tag-in-flora = Em FLoRA

## Note Template
replication-checker-note-title = Replicações Encontradas
replication-checker-note-warning = Esta nota é gerada automaticamente. Se você editá-la, uma nova nota será criada na próxima verificação e esta versão será mantida como está.
replication-checker-note-intro = Este estudo foi replicado:
replication-checker-note-feedback = Achou este resultado útil? Forneça feedback <a href="{ $url }" target="_blank">aqui</a>!
replication-checker-note-data-issues = Encontrou algum problema nos dados? Por favor, reporte-o <a href="{ $url }" target="_blank">aqui</a>!
replication-checker-note-footer = Gerado pelo Verificador de Replicações do Zotero usando a Base de Dados de Literatura FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Nenhum título disponível
replication-checker-li-no-authors = Nenhum autor disponível
replication-checker-li-no-journal = Sem revista
replication-checker-li-na = N/D
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Resultado Relatado pelo Autor:
replication-checker-li-link = Este estudo tem um relatório vinculado:

## First Run Prompt
replication-checker-prompt-title = Bem-vindo ao Verificador de Replicações do Zotero!
replication-checker-prompt-first-run =
    Obrigado por instalar o Verificador de Replicações do Zotero!

    Este plugin ajuda você a descobrir estudos de replicação para sua pesquisa verificando os itens da sua biblioteca na Base de Dados de Literatura FORRT (FLoRA).

    Deseja analisar sua biblioteca em busca de replicações agora?

    • Clique em "OK" para iniciar a análise (isso pode levar alguns minutos)
    • Clique em "Cancelar" para pular - você sempre pode analisar mais tarde pelo menu Ferramentas

## Onboarding
onboarding-welcome-title = Bem-vindo ao Verificador de Replicações!
onboarding-welcome-content =
    Obrigado por instalar o Verificador de Replicações do Zotero!

    Este plugin ajuda você a descobrir estudos de replicação verificando automaticamente os itens da sua biblioteca na Base de Dados de Literatura FORRT (FLoRA).

    ✨ Recursos principais:
    • Verificação automática de DOIs no banco de dados de replicações
    • Funciona com toda a biblioteca, coleções ou itens individuais
    • Cria notas vinculadas com informações de replicação
    • Marca itens com status de replicação
    • Adiciona estudos originais quando você tem replicações
    • Bane replicações indesejadas de verificações futuras

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

    ⚙️ Preferências:
    Editar → Configurações → Verificador de Replicações
    • Frequência de verificação automática
    • Verificação automática de novos itens

onboarding-scan-title = Pronto para analisar sua biblioteca?
onboarding-scan-content =
    Deseja analisar sua biblioteca em busca de replicações agora?

    • Clique em "Sim" para iniciar a análise
      (isso pode levar alguns minutos)

    • Clique em "Não" para pular - você sempre pode analisar mais tarde pelo menu Ferramentas

    💡 Acesse este guia a qualquer momento:
    Ajuda → Guia do Usuário do Verificador de Replicações

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Banir reprodução

## Reproduction Feature - Tags
reproduction-checker-tag = Tem Reprodução
reproduction-checker-tag-is-reproduction = É uma Reprodução
reproduction-checker-tag-added-by-checker = Adicionado pelo Verificador de Replicações
reproduction-checker-tag-readonly-origin = Original presente em biblioteca somente leitura

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reprodução: Computacionalmente bem-sucedida, Robusta
reproduction-checker-tag-outcome-cs-challenges = Reprodução: Computacionalmente bem-sucedida, Desafios de robustez
reproduction-checker-tag-outcome-cs-not-checked = Reprodução: Computacionalmente bem-sucedida, Robustez não verificada
reproduction-checker-tag-outcome-ci-robust = Reprodução: Problemas computacionais, Robusta
reproduction-checker-tag-outcome-ci-challenges = Reprodução: Problemas computacionais, Desafios de robustez
reproduction-checker-tag-outcome-ci-not-checked = Reprodução: Problemas computacionais, Robustez não verificada

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproduções Encontradas
reproduction-checker-note-warning = Esta nota é gerada automaticamente. Se você editá-la, uma nova nota será criada na próxima verificação e esta versão será mantida como está.
reproduction-checker-note-intro = Este estudo foi reproduzido:
reproduction-checker-note-feedback = Achou este resultado útil? Forneça feedback <a href="{ $url }" target="_blank">aqui</a>!
reproduction-checker-note-data-issues = Encontrou algum problema nos dados? Por favor, reporte-o <a href="{ $url }" target="_blank">aqui</a>!
reproduction-checker-note-footer = Gerado pelo Verificador de Replicações do Zotero usando a Base de Dados de Literatura FORRT (FLoRA)

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
    Tem certeza de que deseja banir { $count } reprodução(ões)?

    Estes itens serão movidos para a lixeira e não serão readicionados em verificações futuras.
reproduction-checker-ban-success = { $count } reprodução(ões) banida(s) com sucesso.

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = Estudos de Reprodução Encontrados
reproduction-checker-dialog-intro = Estudos de reprodução encontrados para:\n"{ $title }"
reproduction-checker-dialog-count = { $count } reprodução(ões) encontrada(s):
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Resultado: { $outcome }
reproduction-checker-dialog-more = ...e mais { $count } reprodução(ões)
reproduction-checker-dialog-question = Deseja adicionar informações de reprodução?
reproduction-checker-dialog-progress-title = Informações de Reprodução Adicionadas
reproduction-checker-dialog-progress-line = Informações de reprodução adicionadas a "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = { $count } item(ns) com reproduções encontrado(s)

## Preference Pane
pref-autocheck-title = Verificação Automática da Biblioteca para Replicações
pref-autocheck-description = Verificar automaticamente sua biblioteca para estudos de replicação em intervalos regulares
pref-autocheck-disabled = Desativado (somente verificação manual)
pref-autocheck-daily = Diário (verificar a cada 24 horas)
pref-autocheck-weekly = Semanal (verificar a cada 7 dias)
pref-autocheck-monthly = Mensal (verificar a cada 30 dias)
pref-autocheck-new-items = Verificar automaticamente novos itens adicionados à biblioteca (recomendado)
pref-autocheck-new-items-hint = Desative esta opção se preferir executar todas as verificações de replicação manualmente.
pref-autocheck-note = A verificação automática é executada em segundo plano quando o Zotero está aberto. Você ainda pode verificar manualmente pelo menu Ferramentas.
pref-blacklist-title = Replicações Banidas
pref-blacklist-description = Gerenciar replicações que você baniu de aparecer na sua biblioteca
pref-blacklist-col-replication = Artigo de Replicação
pref-blacklist-col-original = Artigo Original
pref-blacklist-col-type = Tipo
pref-blacklist-col-banned = Banido em
pref-blacklist-empty = Nenhuma replicação banida
pref-blacklist-remove = Remover selecionado
pref-blacklist-clear = Limpar todas as replicações banidas
pref-blacklist-hint = Replicações banidas não serão readicionadas em verificações futuras. Você pode banir replicações usando o menu de contexto.
