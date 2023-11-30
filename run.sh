#!/bin/bash
#
source .env

docker run --detach \
    --name nginx-proxy \
    --publish 80:80 \
    --publish 443:443 \
    --volume /etc/nginx/certs:/etc/nginx/certs \
    --volume /etc/nginx/vhost.d:/etc/nginx/vhost.d \
    --volume /var/www/html:/usr/share/nginx/html \
    --volume /var/run/docker.sock:/tmp/docker.sock:ro \
    nginxproxy/nginx-proxy

docker run --detach \
    --name nginx-proxy-acme \
    --volumes-from nginx-proxy \
    --volume /var/run/docker.sock:/var/run/docker.sock:ro \
    --volume acme:/etc/acme.sh \
    --env "DEFAULT_EMAIL=info@indusscript.info" \
    nginxproxy/acme-companion

docker run --detach \
    --name mysqld \
    --publish 172.18.0.1:3306:3306 \
    -e MYSQL_ROOT_PASSWORD=$MYSQLDB_ROOT_PASSWORD \
    -e MYSQL_DATABASE=$MYSQLDB_DATABASE \
    -v db:/var/lib/mysql \
    -v $(pwd)/population-script.sql:/docker-entrypoint-initdb.d/population-script.sql \
    mysql:latest mysqld --mysqlx=0

docker run --detach \
    --name harappa \
    --publish 172.18.0.1:3000:3000 \
      -e DB_HOST=172.18.0.1 \
      -e DB_USER=$MYSQLDB_USER \
      -e DB_PASSWORD=$MYSQLDB_ROOT_PASSWORD \
      -e DB_NAME=$MYSQLDB_DATABASE \
      -e DB_PORT=$MYSQLDB_LOCAL_PORT \
      -e NODE_ENV=production \
      -e VIRTUAL_HOST=indusscript.info \
      -e LETSENCRYPT_HOST=indusscript.info \
      -e VIRTUAL_PORT=3000 \
      indus:latest
