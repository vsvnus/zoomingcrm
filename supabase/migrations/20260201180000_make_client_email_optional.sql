-- Make client email optional
ALTER TABLE "clients" ALTER COLUMN "email" DROP NOT NULL;
