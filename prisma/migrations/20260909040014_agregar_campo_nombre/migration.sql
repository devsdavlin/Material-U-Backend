-- CreateTable
CREATE TABLE "warehouse" (
    "id_warehouse" SERIAL NOT NULL,
    "warehouse_name" VARCHAR NOT NULL,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id_warehouse")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "email" VARCHAR NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "rol" VARCHAR NOT NULL,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id_warehouse") ON DELETE RESTRICT ON UPDATE CASCADE;
