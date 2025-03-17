FROM docker.elastic.co/elasticsearch/elasticsearch:8.16.4
# Switch to root user to ensure proper permissions
# USER root

# # Set environment variables
# ENV NETWORK_HOST=0.0.0.0 \
#     ES_JAVA_OPTS="-Xmx512m -Xms512m" \
#     NODE_NAME=es01 \
#     CLUSTER_NAME=${CLUSTER_NAME} \
#     DISCOVERY_TYPE=single-node \
#     ELASTIC_PASSWORD=${ELASTIC_PASSWORD} \
#     BOOTSTRAP_MEMORY_LOCK=true \
#     XPACK_SECURITY_ENABLED=true \
#     XPACK_SECURITY_HTTP_SSL_ENABLED=true \
#     XPACK_SECURITY_HTTP_SSL_KEY=config/certs/es01/es01.key \
#     XPACK_SECURITY_HTTP_SSL_CERTIFICATE=config/certs/es01/es01.crt \
#     XPACK_SECURITY_HTTP_SSL_CERTIFICATE_AUTHORITIES=config/certs/ca/ca.crt \
#     XPACK_SECURITY_TRANSPORT_SSL_ENABLED=true \
#     XPACK_SECURITY_TRANSPORT_SSL_KEY=config/certs/es01/es01.key \
#     XPACK_SECURITY_TRANSPORT_SSL_CERTIFICATE=config/certs/es01/es01.crt \
#     XPACK_SECURITY_TRANSPORT_SSL_CERTIFICATE_AUTHORITIES=config/certs/ca/ca.crt \
#     XPACK_SECURITY_TRANSPORT_SSL_VERIFICATION_MODE=certificate \
#     XPACK_LICENSE_SELF_GENERATED_TYPE=${LICENSE}

# # Create necessary directories
# RUN mkdir -p /usr/share/elasticsearch/config/certs \
#     /usr/share/elasticsearch/data

# Set correct permissions
# RUN chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/config/certs \
#     /usr/share/elasticsearch/data

# # Switch to elasticsearch user
# USER elasticsearch

# Default command to run elasticsearch
# CMD ["/usr/share/elasticsearch/bin/elasticsearch"]
CMD ["/bin/tini", "--", "/usr/local/bin/docker-entrypoint.sh", "eswrapper"]

