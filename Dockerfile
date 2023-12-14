FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["node", "scrape2.js"]
EXPOSE 3000