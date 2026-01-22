-- Get table information
WITH table_info AS (
    SELECT 
        t.table_name,
        json_agg(
            json_build_object(
                'column_name', c.column_name,
                'data_type', c.data_type,
                'is_nullable', c.is_nullable,
                'column_default', c.column_default
            ) ORDER BY c.ordinal_position
        ) as columns
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
),
-- Get enum types
enum_info AS (
    SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    GROUP BY t.typname
),
-- Get foreign key relationships
fk_info AS (
    SELECT
        tc.table_name,
        json_agg(
            json_build_object(
                'column_name', kcu.column_name,
                'foreign_table_name', ccu.table_name,
                'foreign_column_name', ccu.column_name
            )
        ) as foreign_keys
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    GROUP BY tc.table_name
),
-- Get RLS policies
policy_info AS (
    SELECT 
        schemaname,
        tablename,
        json_agg(
            json_build_object(
                'policyname', policyname,
                'cmd', cmd,
                'qual', qual,
                'with_check', with_check,
                'permissive', permissive
            )
        ) as policies
    FROM pg_policies
    GROUP BY schemaname, tablename
),
-- Get indexes
index_info AS (
    SELECT 
        schemaname,
        tablename,
        json_agg(
            json_build_object(
                'indexname', indexname,
                'indexdef', indexdef
            )
        ) as indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename
)
-- Combine all information
SELECT json_build_object(
    'tables', json_object_agg(t.table_name, json_build_object(
        'columns', t.columns,
        'foreign_keys', COALESCE(f.foreign_keys, '[]'::json),
        'policies', COALESCE(p.policies, '[]'::json),
        'indexes', COALESCE(i.indexes, '[]'::json)
    )),
    'enums', json_object_agg(e.enum_name, e.enum_values)
)
FROM table_info t
LEFT JOIN fk_info f ON t.table_name = f.table_name
LEFT JOIN policy_info p ON t.table_name = p.tablename
LEFT JOIN index_info i ON t.table_name = i.tablename
CROSS JOIN enum_info e;
