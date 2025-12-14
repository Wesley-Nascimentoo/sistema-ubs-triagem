# Setup do Banco de Dados

Este projeto usa PostgreSQL como banco de dados. Siga as instruções abaixo para configurar o ambiente.

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ e pnpm

## Iniciando o PostgreSQL com Docker

1. **Inicie o container PostgreSQL:**

```bash
docker-compose up -d
```

Isso iniciará um container PostgreSQL com as seguintes credenciais:
- **Usuário**: triagem_user
- **Senha**: triagem_password
- **Banco de dados**: sistema_ubs_triagem
- **Porta**: 5432

2. **Verifique se o container está rodando:**

```bash
docker-compose ps
```

Você deve ver o container `sistema-ubs-triagem-db` com status `Up`.

## Configurando o Banco de Dados

1. **Configure a variável de ambiente DATABASE_URL:**

A variável já está configurada automaticamente pela plataforma Manus com o valor:
```
postgresql://triagem_user:triagem_password@localhost:5432/sistema_ubs_triagem
```

2. **Execute as migrações do banco de dados:**

```bash
pnpm db:push
```

Este comando irá:
- Gerar os arquivos de migração baseado no schema (`drizzle/schema.ts`)
- Aplicar as migrações ao banco de dados

3. **Verifique se as tabelas foram criadas:**

Você pode conectar ao banco usando um cliente PostgreSQL:

```bash
psql postgresql://triagem_user:triagem_password@localhost:5432/sistema_ubs_triagem
```

Ou use uma ferramenta como DBeaver ou pgAdmin.

## Parando o PostgreSQL

Para parar o container:

```bash
docker-compose down
```

Para remover também os dados persistidos:

```bash
docker-compose down -v
```

## Troubleshooting

### Porta 5432 já está em uso

Se receber um erro de porta já em uso, você pode:

1. Mudar a porta no `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Mude 5432 para 5433
```

2. Atualizar a `DATABASE_URL`:
```
postgresql://triagem_user:triagem_password@localhost:5433/sistema_ubs_triagem
```

### Erro de conexão ao banco

Verifique se:
1. O container está rodando: `docker-compose ps`
2. A porta está correta
3. As credenciais estão corretas

### Resetar o banco de dados

Para resetar completamente o banco de dados:

```bash
docker-compose down -v
docker-compose up -d
pnpm db:push
```

## Estrutura do Schema

O schema do banco está definido em `drizzle/schema.ts`. Qualquer alteração no schema deve ser feita neste arquivo e depois aplicada com `pnpm db:push`.

Exemplo de adição de uma nova tabela:

```typescript
// drizzle/schema.ts
export const appointments = pgTable("appointments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: integer("patientId").notNull(),
  // ... mais colunas
});
```

Depois execute:
```bash
pnpm db:push
```
