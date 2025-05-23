-- Add payment_type to loan_payments table (20230701000001)

-- Add the payment_type column to the loan_payments table
ALTER TABLE "public"."loan_payments" ADD COLUMN "payment_type" text NULL;

-- Add check constraint to validate payment_type
ALTER TABLE "public"."loan_payments"
  ADD CONSTRAINT "chk_loan_payments_payment_type" 
  CHECK (payment_type IN ('regular', 'principal', 'interest', 'restructured', 'other'));

-- Create an index for faster queries filtered by payment_type
CREATE INDEX "idx_loan_payments_payment_type" ON "public"."loan_payments" ("payment_type");

-- Add a comment on the column to document its purpose
COMMENT ON COLUMN "public"."loan_payments"."payment_type" IS 'Type of payment: regular, principal, interest, restructured, or other'; 