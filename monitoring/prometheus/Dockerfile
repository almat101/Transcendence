FROM debian:bullseye

RUN apt update

RUN apt -y upgrade

RUN apt -y install wget vim curl

# RUN wget https://github.com/prometheus/prometheus/releases/download/v2.55.1/prometheus-2.55.1.linux-amd64.tar.gz -O /tmp/prometheus.tar.gz \
# 	&& tar -C /usr/local/bin -xzf /tmp/prometheus.tar.gz \
# 	&& rm /tmp/prometheus.tar.gz

RUN wget https://github.com/prometheus/prometheus/releases/download/v3.2.1/prometheus-3.2.1.linux-amd64.tar.gz -O /tmp/prometheus.tar.gz \
    && tar -C /usr/local/bin -xzf /tmp/prometheus.tar.gz \
    && rm /tmp/prometheus.tar.gz

# RUN wget https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz -O /tmp/node_exporter.tar.gz \
# 	&& tar -C /usr/local/bin -xzf /tmp/node_exporter.tar.gz \
# 	&& rm /tmp/node_exporter.tar.gz

# RUN rm -rf /usr/local/bin/prometheus-2.55.1.linux-amd64/prometheus.yml

#remove old prometheus.yml
RUN rm -rf /usr/local/bin/prometheus-3.2.1.linux-amd64/prometheus.yml

#copy new prometheus.yml
COPY /conf/prometheus.yml /usr/local/bin/prometheus-3.2.1.linux-amd64/prometheus.yml

# COPY /conf/prometheus.yml /usr/local/bin/prometheus-2.55.1.linux-amd64/prometheus.yml

CMD ["/usr/local/bin/prometheus-3.2.1.linux-amd64/prometheus", "--config.file=/usr/local/bin/prometheus-3.2.1.linux-amd64/prometheus.yml"]

# CMD ["./usr/local/bin/prometheus-2.55.1.linux-amd64/prometheus", "--config.file=/usr/local/bin/prometheus-2.55.1.linux-amd64/prometheus.yml"]