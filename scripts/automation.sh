#!/bin/sh

set -e

home="/app/dist"
cd $home

echo "Waiting for database ready..."
echo DBNAME: ${DBNAME}
echo DBHOST: ${DBHOST}
echo DBPORT: ${DBPORT}
echo HOST: ${HOST}
echo HOST_PORT: ${HOST_PORT}

npm run check_db
echo "RUN DB MIGRATION"
echo "================"
npx sequelize-cli db:migrate

echo "CREATE ROLE AND USER"
echo "===================="
npm run create_user
npm run start
echo "================================="
echo "YOUR SERVER IS UP AND RUNNING NOW"
echo "================================="