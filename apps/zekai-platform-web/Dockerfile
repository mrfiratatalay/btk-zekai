FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
ENV PORT=3000
ENV NEXT_PUBLIC_DATA_MODE=api
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "dev"]
