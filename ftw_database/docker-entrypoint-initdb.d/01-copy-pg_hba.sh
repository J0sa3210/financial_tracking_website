#!/bin/bash
set -e

# Only copy if initializing a new database
if [ "$1" = 'postgres' ]; then                      # -> Check if the process is postgres
  cp /tmp/pg_hba.conf "$PGDATA/pg_hba.conf"         # -> Copy the right folder
  chown postgres:postgres "$PGDATA/pg_hba.conf"     # -> Set right permissions
fi