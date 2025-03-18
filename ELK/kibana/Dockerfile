# FROM docker.elastic.co/kibana/kibana:8.16.4
FROM docker.elastic.co/kibana/kibana:8.16.5


# # Set environment variables
# ENV SERVERNAME=kibana \
#     ELASTICSEARCH_HOSTS=https://es01:9200 \
#     ELASTICSEARCH_USERNAME=kibana_system \
#     ELASTICSEARCH_SSL_CERTIFICATEAUTHORITIES=/usr/share/kibana/config/certs/ca/ca.crt \
#     XPACK_SECURITY_ENCRYPTIONKEY=${ENCRYPTION_KEY} \
#     XPACK_ENCRYPTEDSAVEDOBJECTS_ENCRYPTIONKEY=${ENCRYPTION_KEY} \
#     XPACK_REPORTING_ENCRYPTIONKEY=${ENCRYPTION_KEY} \
#     XPACK_REPORTING_ROLES_ENABLED=false \
#     XPACK_REPORTING_KIBANASERVER_HOSTNAME=localhost

COPY config/kibana.yml /usr/share/kibana/config/kibana.yml

# Expose Kibana port
EXPOSE 5601

# Default command to start Kibana
CMD ["/bin/tini", "--", "/usr/local/bin/kibana-docker"]
