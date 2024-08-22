FROM node:22-bullseye

COPY . .

RUN npm ci

CMD ["npm", "start"]
