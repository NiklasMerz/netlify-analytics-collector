FROM node:alpine

COPY . .

RUN npm install --production

ENTRYPOINT ["node", "/index.js"]
