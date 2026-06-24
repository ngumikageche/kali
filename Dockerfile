FROM node:20.19.1

RUN apt-get update && apt-get install -y sudo \
    && useradd -m web_dev && echo "web_dev:pa55word" | chpasswd \
    && echo "web_dev ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/web_dev/kalit

COPY . .

RUN chown -R web_dev:web_dev /home/web_dev/kalit

USER web_dev

RUN npm install && sudo npm install -g serve && npm run build

COPY serve.json dist/

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
