FROM node:alpine3.12

#ENV MONGO_DB_USERNAME=admin \
#    MONGO_DB_PWD=password

RUN mkdir -p /home/app/server
WORKDIR /home/app/server

COPY package.json /home/app/server
COPY package-lock.json /home/app/server

RUN npm install

COPY . /home/app/server

CMD ["npm", "start"]