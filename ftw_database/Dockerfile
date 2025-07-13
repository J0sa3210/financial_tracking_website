FROM postgres:latest

# Copy custom pg_hba.conf to a temporary location
COPY pg_hba.conf /tmp/pg_hba.conf

# Entrypoint script to copy pg_hba.conf after init
COPY docker-entrypoint-initdb.d/01-copy-pg_hba.sh /docker-entrypoint-initdb.d/01-copy-pg_hba.sh
RUN chmod +x /docker-entrypoint-initdb.d/01-copy-pg_hba.sh