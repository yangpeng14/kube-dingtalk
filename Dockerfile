FROM node:10-alpine

# Don't run as root user
ENV user kube-dingtalk

RUN echo "http://mirrors.aliyun.com/alpine/v3.8/main/" > /etc/apk/repositories \
    && apk update \
    && apk add python2 openssl ca-certificates make gcc g++ \
    && rm -rf /var/cache/apk/*

RUN addgroup -S $user && adduser -S -g $user $user

USER $user

WORKDIR /app
COPY package.json /app
RUN npm config set registry https://registry.npm.taobao.org && npm install --production

COPY . /app

CMD ["node", "."]
