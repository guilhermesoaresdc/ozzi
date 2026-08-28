-- Tamanho único, para acessórios e peças sem grade.
-- ALTER TYPE ADD VALUE precisa da própria transação: não junte com outra migration.
alter type public.size_code add value if not exists 'U';
