FROM node:4.2.3

MAINTAINER David Gaya

LABEL version="1.0"

LABEL description="Private npm registry based in sinopia"

WORKDIR /root
RUN git clone https://github.com/dgaya/sinopia.git
WORKDIR /root/sinopia
RUN git checkout github_oauth_login
RUN npm install

EXPOSE 4873
CMD ["./bin/sinopia", "-c", "./config/config.yaml", "-l", "0.0.0.0:4873"]

# run with
# docker run -d -v $PWD/config:/root/sinopia/config -v $PWD/log:/root/sinopia/log -p 4873:4873 --name npm_server sinopia
