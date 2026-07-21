/*
  # Make name/company optional on report_downloads

  The report download / audience export forms now only require an email + checklist.
  We still track submissions, but no longer require capturing name or company.
*/

ALTER TABLE report_downloads
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN company DROP NOT NULL;

