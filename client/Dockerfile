FROM node:alpine3.12

#ENV MONGO_DB_USERNAME=admin \
#    MONGO_DB_PWD=password

RUN mkdir -p /home/app/client
WORKDIR /home/app/client

COPY package.json /home/app/client
COPY package-lock.json /home/app/client

RUN npm install

COPY . /home/app/client

CMD ["npm", "start"]