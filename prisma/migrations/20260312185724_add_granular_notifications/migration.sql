-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notify_email_client_comment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_email_internal_comment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_email_status_change" BOOLEAN NOT NULL DEFAULT true;
