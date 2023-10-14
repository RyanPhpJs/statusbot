FROM node:20
WORKDIR /home/container
COPY package*.json ./
RUN npm install
COPY . .
LABEL maintainer="RyanPhpJs <ryan.matheus@aluno.ifsp.edu.br>"
CMD ["node", "index.js"]