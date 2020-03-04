ARG SDK_VERSION
ARG ARCHITECTURE
FROM egeoffrey/egeoffrey-sdk-alpine:${SDK_VERSION}-${ARCHITECTURE}
RUN apk update && apk add nginx musl-dev openssl-dev gcc libffi-dev curl expect sshpass openssh-client && rm -rf /var/cache/apk/*
RUN pip install --upgrade setuptools && pip install fuzzywuzzy redis==2.10.6 rq==0.12.0 pymongo slackclient python-telegram-bot pyicloud click==6.7 feedparser
RUN mkdir -p gui/html && ln -s $(pwd)/sdk gui/html/sdk && mkdir -p /run/nginx
COPY . $WORKDIR
