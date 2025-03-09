-- CreateTable
CREATE TABLE "conversation" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "user_id" TEXT NOT NULL,
    "property_id" INTEGER,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "conversation_id" INTEGER NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" DOUBLE PRECISION NOT NULL,
    "square_feet" INTEGER NOT NULL,
    "property_type" TEXT NOT NULL,
    "year_built" INTEGER,
    "description" TEXT,
    "image_urls" TEXT[],

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
