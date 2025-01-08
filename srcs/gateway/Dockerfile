FROM nginx:latest

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y vim

COPY conf/nginx.conf /etc/nginx/nginx.conf

COPY tools/api_gateway.sh /usr/local/bin/api_gateway.sh
RUN chmod +x /usr/local/bin/api_gateway.sh

CMD ["/usr/local/bin/api_gateway.sh"]
