-- CreateTable
CREATE TABLE "public"."Users" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "groupId" INTEGER,
    "isRefresh" BOOLEAN NOT NULL DEFAULT false,
    "addDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "openPayCustomerId" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "cologne" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Card" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "expirationYear" TEXT NOT NULL,
    "expirationMonth" TEXT NOT NULL,
    "allowsCharges" BOOLEAN NOT NULL,
    "allowsPayouts" BOOLEAN NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL,
    "bankName" TEXT,
    "bankCode" TEXT,
    "pointsCard" BOOLEAN NOT NULL,
    "addressId" INTEGER NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "line3" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_openPayCustomerId_key" ON "public"."Users"("openPayCustomerId");

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Users"("openPayCustomerId") ON DELETE SET NULL ON UPDATE CASCADE;
