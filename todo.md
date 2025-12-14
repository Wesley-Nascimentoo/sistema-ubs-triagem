# Sistema UBS Triagem - TODO

## Autenticação e Rotas
- [x] Implementar sistema de autenticação com localStorage
- [x] Criar rota de login para pacientes
- [x] Criar rota de login para funcionários (enfermeiro, médico, gestor)
- [ ] Implementar proteção de rotas por tipo de usuário

## Telas de Paciente
- [x] Criar tela de login do paciente (número do cartão SUS)
- [x] Criar tela de seleção de sintomas com ícones específicos
- [x] Implementar questionário dinâmico por tipo de atendimento
- [x] Implementar lógica do Protocolo de Manchester para priorização
- [x] Criar tela de sucesso mostrando posição na fila e prioridade
- [x] Implementar controle de limite de 16 fichas por turno (manhã/tarde)
- [x] Criar tela informando que acabaram as fichas

## Painel do Enfermeiro
- [x] Criar tela de login do enfermeiro
- [x] Criar painel mostrando fila de triagem
- [x] Implementar funcionalidade de chamar próximo paciente
- [x] Criar formulário de dados de triagem (pressão, febre, etc)
- [x] Implementar encerramento de atendimento de triagem

## Painel do Médico
- [x] Criar tela de login do médico
- [x] Criar painel mostrando fila de atendimento médico
- [x] Implementar funcionalidade de chamar próximo paciente
- [x] Implementar encerramento de atendimento médico

## Painel de Filas
- [x] Criar tela pública mostrando fila de triagem
- [x] Criar tela pública mostrando fila de atendimento médico
- [x] Implementar atualização em tempo real das filas

## Dashboard do Gestor
- [x] Criar tela de login do gestor
- [x] Implementar gráficos de atendimentos por dia
- [x] Implementar gráficos de atendimentos por tipo
- [x] Implementar gráficos de distribuição por prioridade (Manchester)
- [x] Implementar métricas de tempo médio de atendimento
- [x] Implementar visualização de ocupação de fichas

## Sistema de Dados (LocalStorage)
- [x] Criar estrutura de dados para pacientes
- [x] Criar estrutura de dados para filas
- [x] Criar estrutura de dados para atendimentos
- [x] Criar estrutura de dados para usuários (funcionários)
- [x] Implementar funções auxiliares para gerenciar localStorage

## Design e UI
- [x] Definir paleta de cores profissional
- [x] Criar layout responsivo
- [x] Implementar ícones para tipos de atendimento
- [x] Criar componentes reutilizáveis
- [x] Aplicar tema moderno e profissional

## Ajustes Solicitados
- [x] Remover campo de nome completo do login do paciente
- [x] Remover botão de login de funcionários da página de paciente
- [x] Ajustar fluxo para não pedir nome do paciente

## Bugs Encontrados
- [x] Erro ao chamar paciente na pré-triagem (painel do enfermeiro) - CORRIGIDO: faltava import de useState e useEffect

## Banco de Dados
- [x] Criar docker-compose.yml com PostgreSQL
- [x] Atualizar schema para PostgreSQL
- [x] Configurar DATABASE_URL para PostgreSQL

## Ajustes Solicitados - Voz e Consultórios
- [x] Implementar síntese de voz para anunciar paciente e consultório
- [x] Adicionar número do consultório na exibição das filas
- [x] Anúncio automático ao chamar paciente

## Bugs Encontrados - QueuesDisplay
- [x] Corrigir erro de "Maximum update depth exceeded" no useEffect - CORRIGIDO: adicionado useCallback e ref para controlar anúncios
- [x] Corrigir erros de "Speech error: interrupted" na síntese de voz - CORRIGIDO: ignorar erros de interrupção
- [x] Otimizar renderização do componente - CORRIGIDO: adicionado useCallback para loadQueues
