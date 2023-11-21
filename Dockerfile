FROM node:18 AS BUILDER
WORKDIR /app
COPY . .
ARG npm_token

RUN echo -e "\n//npm.pkg.github.com/:_authToken=$npm_token" >> .npmrc && \
    npm install --prod --omit=dev
RUN npm run build 

FROM node:18-slim
ENV TZ=America/Cancun
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /app
COPY --from=BUILDER /app .
EXPOSE 3000
CMD ["node","server.js"]
