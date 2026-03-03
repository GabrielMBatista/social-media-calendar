-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_account_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "account_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
