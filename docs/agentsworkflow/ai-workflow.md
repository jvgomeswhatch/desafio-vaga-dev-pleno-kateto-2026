# Estratégia de uso de IA

Este documento descreve como IA foi utilizada no desenvolvimento deste projeto — o que o humano decide, o que os agentes fazem e como as responsabilidades estão divididas.

## Princípio central

IA não define o produto. IA implementa e revisa dentro de limites definidos pelo humano.

Toda decisão de arquitetura, modelagem de domínio e priorização foi tomada antes de qualquer instrução ser dada ao agente. O agente implementa e revisa — não decide.

---

## Responsabilidades humanas

- Definição da arquitetura (Go + Next.js, separação backend/frontend, PostgreSQL)
- Modelagem do domínio (tabelas, regra do round robin, fluxo do kanban)
- Escolha de tecnologias e justificativas
- Priorização do roadmap e sequência de fases
- Aprovação final de toda alteração antes de commit
- Validação manual dos fluxos críticos (round robin, autenticação, kanban)
- Revisão de segurança (JWT, bcrypt, queries parametrizadas)

## Responsabilidades dos agentes

### Implementação

O agente principal (Claude Code) implementa tarefas isoladas a partir de requisitos já definidos pelo humano. Nunca decide stack, nunca modela domínio, nunca escolhe arquitetura.

### Revisão especializada por domínio

Cada agente abaixo é invocado em um momento específico do desenvolvimento — não continuamente, não aleatoriamente.

| Agente | Responsabilidade | Quando |
|---|---|---|
| `marketplace-requirements-auditor` | Valida cobertura dos requisitos do desafio | Fases 0, 5, 10 |
| `business-logic-enforcer` | Valida round robin, kanban, validações de input | Após qualquer mudança na regra de negócio |
| `go-api-reviewer` | Revisa handlers, services, repositories, idiomas Go | Após cada feature de backend |
| `sql-schema-validator` | Valida schema, migrations, prevenção de SQL injection | Após migrations |
| `typescript-frontend-reviewer` | Revisa type safety, design system, acessibilidade, UX | Após features de frontend |
| `codebase-consistency-auditor` | Detecta lógica duplicada e modelos paralelos | Fases 2, 9, 10 |
| `container-security-reviewer` | Revisa Dockerfiles, compose, headers HTTP, JWT | Fases 3 e 7 |
| `github-actions-pipeline-reviewer` | Revisa workflows de CI/CD | Após criar ou alterar pipeline |
| `documentation-completeness-checker` | Verifica que README, ADR e docs estão completos | Pré-entrega |

---

## O que o agente não faz

- Não commita sem validação manual do humano
- Não gera planos completos sem discussão — cada decisão é alinhada antes
- Não escolhe bibliotecas ou dependências sem aprovação explícita
- Não toma decisões de segurança (JWT storage, hashing, etc.)

---

## Fluxo de desenvolvimento

```
Humano define requisito da fase
        ↓
Agente implementa
        ↓
Agente revisor especializado audita
        ↓
Humano valida manualmente
        ↓
Commit aprovado
```

Nenhuma fase é pulada. Nenhum commit acontece sem a validação do passo anterior.
