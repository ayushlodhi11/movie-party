# base image
FROM node:12.13.0
ENV NODE_VERSION 12.13.0

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
RUN mkdir /usr/src/nvm
ENV NVM_DIR /usr/src/nvm

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
RUN . "$NVM_DIR/nvm.sh" && nvm --version

# install and cache app dependencies
RUN . "$NVM_DIR/nvm.sh" && npm install --silent
RUN . "$NVM_DIR/nvm.sh" && npm install yarn -g --silent
RUN . "$NVM_DIR/nvm.sh" && npm install pm2 -g --silent

# Install nvm with node and npm

COPY package.json ./

RUN . "$NVM_DIR/nvm.sh" && yarn install

COPY . .

RUN . "$NVM_DIR/nvm.sh" && yarn build

ENTRYPOINT ["build/docker-entrypoint.sh"]

# start app
CMD ["yarn", "start_in_docker"]
