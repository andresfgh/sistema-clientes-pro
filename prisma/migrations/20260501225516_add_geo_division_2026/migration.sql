-- AlterTable
ALTER TABLE "Direccion" ADD COLUMN     "distritoId" TEXT,
ADD COLUMN     "es_ubicacion_personalizada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "puntoReferencia" TEXT,
ADD COLUMN     "referenciaEspecifica" TEXT,
ADD COLUMN     "referenciaPrimaria" TEXT;

-- CreateTable
CREATE TABLE "Departamento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamentoId" TEXT NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distrito" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "municipioId" TEXT NOT NULL,

    CONSTRAINT "Distrito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nombre_key" ON "Departamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_nombre_departamentoId_key" ON "Municipio"("nombre", "departamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Distrito_nombre_municipioId_key" ON "Distrito"("nombre", "municipioId");

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distrito" ADD CONSTRAINT "Distrito_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direccion" ADD CONSTRAINT "Direccion_distritoId_fkey" FOREIGN KEY ("distritoId") REFERENCES "Distrito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
