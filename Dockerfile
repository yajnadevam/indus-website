FROM alpine:latest
RUN apk update && apk add nodejs npm

WORKDIR ./harappa-app
COPY package.json .
RUN npm install
COPY . .
CMD NODE_ENV=production npm start
