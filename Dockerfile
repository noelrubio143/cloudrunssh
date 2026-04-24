FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY proxy3.js .
COPY run.sh .

RUN chmod +x run.sh

EXPOSE 8080

CMD ["bash", "run.sh"]
