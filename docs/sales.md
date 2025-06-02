# Sales

## Description
The Sales table records items sold to borrowers, which may be associated with specific loans.

## Table Structure

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key for the sale entry |
| borrower_name | TEXT | Name of the borrower purchasing the item |
| item_name | TEXT | Name of the item being sold |
| description | TEXT | Description of the item |
| price | NUMERIC | Price of the item (renamed from raw_price) |
| image_url | TEXT | URL to an image of the item |
| created_by | UUID | Reference to the user who created the sale record |
| created_at | TIMESTAMPTZ | Timestamp when the record was created |
| updated_at | TIMESTAMPTZ | Timestamp when the record was last updated |
| loan_id | INTEGER | Foreign key linking the sale to a specific loan |

## Indexes

| Index Name | Columns | Purpose |
| ---------- | ------- | ------- |
| idx_sales_loan_id | loan_id | Optimize lookups by loan |

## Relationships
- A sale may be associated with a specific loan
- A sale is created by a specific user 