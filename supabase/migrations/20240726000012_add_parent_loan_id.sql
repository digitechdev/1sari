-- Add parent_loan_id to the loans table (20230701000000)

-- Enable RLS
ALTER TABLE "public"."loans" ALTER COLUMN "id" SET DATA TYPE bigint;

-- Add the parent_loan_id column to the loans table
ALTER TABLE "public"."loans" ADD COLUMN "parent_loan_id" bigint NULL;

-- Add a foreign key constraint to ensure referential integrity
ALTER TABLE "public"."loans"
  ADD CONSTRAINT "fk_loans_parent_loan_id" 
  FOREIGN KEY ("parent_loan_id") 
  REFERENCES "public"."loans" ("id") 
  ON DELETE SET NULL;

-- Add an index to improve query performance when looking up child loans
CREATE INDEX "idx_loans_parent_loan_id" ON "public"."loans" ("parent_loan_id");

-- Update comment on the table to reflect the new relationship
COMMENT ON TABLE "public"."loans" IS 'Stores loan information including restructuring history through parent_loan_id'; 