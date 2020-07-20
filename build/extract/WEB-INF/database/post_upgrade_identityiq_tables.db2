--
-- This script contains DDL statements to cleanup a database schema after
-- an upgrade has occurred.  In some circumstances, we may need to keep legacy
-- columns/tables around to perform an upgrade.  After the upgrade has been
-- successfully completed, this script will remove the columns and tables that
-- are no longer necessary.
--

CONNECT TO iiq;


