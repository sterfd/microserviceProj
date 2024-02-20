FROM --platform=linux/amd64 node:18.17.1-alpine 

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 80
CMD npm start