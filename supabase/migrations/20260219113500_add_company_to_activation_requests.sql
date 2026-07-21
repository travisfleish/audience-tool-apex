/*
  # Ensure company column exists on activation_requests

  Some environments created activation_requests without a company column.
  Add it to support requestor company metadata in Deal Desk submissions.
*/

ALTER TABLE activation_requests
  ADD COLUMN IF NOT EXISTS company text;

