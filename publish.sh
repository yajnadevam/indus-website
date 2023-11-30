#!/bin/bash
docker build -t indus:latest --platform linux/amd64 .
scp run.sh root@indusscript.info:/root
ssh root@indusscript.info 'docker stop harappa && docker rm harappa'
ssh root@indusscript.info docker rmi indus:latest
docker save indus:latest | gzip | DOCKER_HOST=ssh://root@indusscript.info docker load
ssh root@indusscript.info /root/run.sh