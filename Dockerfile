FROM node:4.2.3

MAINTAINER David Gaya

LABEL version="1.0"

LABEL description="Private npm registry based in sinopia"

WORKDIR /root/sinopia
RUN git clone https://github.com/dgaya/sinopia.git src
WORKDIR /root/sinopia/src
RUN git checkout github_oauth_login
RUN npm install
WORKDIR /root/sinopia

EXPOSE 4873
CMD ["./src/bin/sinopia", "-c", "./var/config/config.yaml", "-l", "0.0.0.0:4873"]

# run with
# docker run -d -v $PWD:/root/sinopia/var -p 4873:4873 --name npm_server sinopia
# having a config/config.yaml in your PWD
