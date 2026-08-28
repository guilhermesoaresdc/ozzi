# Banco de dados

As migrations em `migrations/` refletem, em ordem, o que está aplicado no
projeto Supabase da Ozzi. Foram aplicadas pelo MCP durante a construção; os
arquivos existem para que o esquema possa ser recriado do zero.

## Ordem

| Arquivo | O que faz |
| --- | --- |
| `0001_schema.sql` | Tabelas, tipos, índices e gatilhos |
| `0002_rls.sql` | Row Level Security de todas as tabelas |
| `0003_customers_crm.sql` | Separa o cadastro de cliente da conta de acesso |
| `0004_size_unico.sql` | Acrescenta o tamanho `U` ao enum de numeração |
| `0005_revoke_trigger_fn_execute.sql` | Tira `handle_new_user` da API pública |
| `0006_criar_pedido_rpc.sql` | `criar_pedido` e `pedido_publico` |
| `0007_indices_e_politicas_enxutas.sql` | Índices de FK e políticas sem sobreposição |
| `0008_storage_produtos.sql` | Bucket público de fotos |
| `0009_auth_tokens_nao_nulos.sql` | Conserta contas criadas por SQL |

`0004` precisa rodar sozinha: o Postgres não deixa usar um valor de enum na
mesma transação em que ele foi criado.

## Por que não existe chave de service role

Toda escrita passa por RLS (o papel `admin` em `profiles.role`) ou pela função
`criar_pedido`, que é `SECURITY DEFINER` e recalcula preço, frete, desconto e
estoque a partir do banco. A aplicação nunca precisa de uma chave que ignore
RLS, então não há segredo de administração para vazar no deploy.

## Criando um administrador

**Pela API de auth** (recomendado): crie a conta pelo site ou pelo painel do
Supabase, em Authentication → Users, e depois promova:

```sql
update public.profiles set role = 'admin' where email = 'pessoa@exemplo.com';
```

**Não crie usuário com INSERT direto em `auth.users`.** O serviço de auth é
escrito em Go e lê `confirmation_token`, `recovery_token` e outras colunas de
token como texto não-nulo; um `INSERT` que deixe qualquer uma dessas colunas
como `NULL` derruba o login inteiro com HTTP 500 antes mesmo de conferir a
senha. Se isso já aconteceu, `0009` conserta.

## Dados de exemplo

O catálogo, os pedidos e os clientes foram semeados durante a construção
(25 produtos, 157 variantes, 8 categorias, 14 pedidos, 8 clientes). Não há
arquivo de seed versionado: o painel é a ferramenta para mexer nesses dados.
