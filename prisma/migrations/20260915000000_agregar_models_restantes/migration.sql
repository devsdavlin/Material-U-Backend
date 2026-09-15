-- AddTable: entries (idempotent)
CREATE TABLE IF NOT EXISTS "entries" (
    "id_entry" SERIAL PRIMARY KEY,
    "entry_number" VARCHAR(50) NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" VARCHAR(150),
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_value" DECIMAL(12,2) NOT NULL,
    "total_value" DECIMAL(12,2) NOT NULL,
    "entry_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- AddTable: exits (idempotent)
CREATE TABLE IF NOT EXISTS "exits" (
    "id_exit" SERIAL PRIMARY KEY,
    "exit_number" VARCHAR(50) NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cost_center" VARCHAR(150),
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_value" DECIMAL(12,2) NOT NULL,
    "total_value" DECIMAL(12,2) NOT NULL,
    "exit_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- AddTable: inventory (idempotent)
CREATE TABLE IF NOT EXISTS "inventory" (
    "id_inventory" SERIAL PRIMARY KEY,
    "warehouse_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "current_stock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "min_stock" DECIMAL(14,2) NOT NULL DEFAULT 0
);

-- AddTable: materials (idempotent)
CREATE TABLE IF NOT EXISTS "materials" (
    "id_material" SERIAL PRIMARY KEY,
    "material_name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "internal_code" VARCHAR(50)
);

-- Unique index on materials.internal_code (only if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'materials_internal_code_unique') THEN
        CREATE UNIQUE INDEX "materials_internal_code_unique" ON "materials"("internal_code");
    END IF;
END $$;

-- Unique index on inventory(warehouse_id, material_id) (only if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'unique_warehouse_material') THEN
        CREATE UNIQUE INDEX "unique_warehouse_material" ON "inventory"("warehouse_id", "material_id");
    END IF;
END $$;

-- ForeignKey: entries -> materials (only if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_entries_material') THEN
        ALTER TABLE "entries" ADD CONSTRAINT "fk_entries_material" FOREIGN KEY ("material_id") REFERENCES "materials"("id_material") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ForeignKey: entries -> users
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_entries_user') THEN
        ALTER TABLE "entries" ADD CONSTRAINT "fk_entries_user" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ForeignKey: entries -> warehouse
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_entries_warehouse') THEN
        ALTER TABLE "entries" ADD CONSTRAINT "fk_entries_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id_warehouse") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ForeignKey: exits -> materials
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_exits_material') THEN
        ALTER TABLE "exits" ADD CONSTRAINT "fk_exits_material" FOREIGN KEY ("material_id") REFERENCES "materials"("id_material") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ForeignKey: exits -> users
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_exits_user') THEN
        ALTER TABLE "exits" ADD CONSTRAINT "fk_exits_user" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ForeignKey: exits -> warehouse
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_exits_warehouse') THEN
        ALTER TABLE "exits" ADD CONSTRAINT "fk_exits_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id_warehouse") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ForeignKey: inventory -> materials
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_material') THEN
        ALTER TABLE "inventory" ADD CONSTRAINT "fk_material" FOREIGN KEY ("material_id") REFERENCES "materials"("id_material") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ForeignKey: inventory -> warehouse
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_warehouse') THEN
        ALTER TABLE "inventory" ADD CONSTRAINT "fk_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id_warehouse") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
