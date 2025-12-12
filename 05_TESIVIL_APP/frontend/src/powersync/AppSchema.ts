import { Column, ColumnType, Schema, Table } from '@powersync/react-native';

export const AppSchema = new Schema({
    users: new Table({
        plan_type: ColumnType.TEXT,
        subscription_expiry: ColumnType.TEXT,
        economic_zone: ColumnType.TEXT,
        reputation_score: ColumnType.INTEGER,
        overhead_percent: ColumnType.REAL,
        profit_percent: ColumnType.REAL,
        technician_hourly_rate: ColumnType.REAL,
        helper_hourly_rate: ColumnType.REAL,
        last_sync_at: ColumnType.TEXT,
        referral_code: ColumnType.TEXT,
        referral_count: ColumnType.INTEGER,
        created_at: ColumnType.TEXT,
        updated_at: ColumnType.TEXT,
    }),
    materials: new Table({
        name: ColumnType.TEXT,
        category_type: ColumnType.TEXT,
        base_price: ColumnType.INTEGER,
        price_min_limit: ColumnType.INTEGER,
        price_max_limit: ColumnType.INTEGER,
        book_time_index: ColumnType.INTEGER,
        confidence_level: ColumnType.TEXT,
        volatility_score: ColumnType.REAL,
        manual_override: ColumnType.INTEGER, // Boolean as Integer (0/1) in SQLite usually, or TEXT 'true'/'false'
        last_verified_at: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
        updated_at: ColumnType.TEXT,
    }),
    user_price_reports: new Table({
        user_id: ColumnType.TEXT,
        material_id: ColumnType.INTEGER, // ID ref
        reported_price: ColumnType.INTEGER,
        evidence_url: ColumnType.TEXT,
        status: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
    }),
    assemblies: new Table({
        name: ColumnType.TEXT,
        category: ColumnType.TEXT,
        base_labor_minutes: ColumnType.INTEGER,
        created_at: ColumnType.TEXT,
    }),
    assembly_definitions: new Table({
        assembly_id: ColumnType.INTEGER,
        material_id: ColumnType.INTEGER,
        quantity: ColumnType.INTEGER,
        is_main_component: ColumnType.INTEGER, // Boolean
    }),
    quotes: new Table({
        user_id: ColumnType.TEXT,
        status: ColumnType.TEXT,
        logistics_tier: ColumnType.INTEGER,
        obstruction_factor: ColumnType.REAL,
        difficulty_factor: ColumnType.REAL,
        is_urgent: ColumnType.INTEGER, // Boolean
        system_labor_total: ColumnType.INTEGER,
        user_labor_override: ColumnType.INTEGER,
        project_name: ColumnType.TEXT,
        client_name: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
        updated_at: ColumnType.TEXT,
    }),
    quote_items: new Table({
        quote_id: ColumnType.TEXT,
        material_id: ColumnType.INTEGER,
        quantity: ColumnType.INTEGER,
        client_supplied: ColumnType.INTEGER, // Boolean
        frozen_unit_price: ColumnType.INTEGER,
        calculated_labor: ColumnType.INTEGER,
        created_at: ColumnType.TEXT,
    }),
    quote_snapshots: new Table({
        quote_id: ColumnType.TEXT,
        user_id: ColumnType.TEXT,
        snapshot_json: ColumnType.TEXT, // JSONB as TEXT
        pdf_url: ColumnType.TEXT,
        created_at: ColumnType.TEXT,
    }),
});
