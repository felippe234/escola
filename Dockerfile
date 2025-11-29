
# Simple Node runtime for apps that run on port 3000
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Install dependencies (including packages required to run/start the app)
RUN npm ci --silent
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
