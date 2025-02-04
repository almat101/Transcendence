FROM nginx:latest

# Install ModSecurity dependencies
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y openssl vim sudo curl net-tools
	# libmodsecurity3 \
	# libnginx-mod-security \
	# modsecurity-crs \
	# && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /etc/nginx/ssl/
# Copy ModSecurity config and CRS rules
# COPY modsecurity/modsecurity.conf /etc/nginx/modsec/modsecurity.conf
# COPY modsecurity/crs/ /etc/nginx/modsec/crs/

# Copy Nginx configuration
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Enable ModSecurity in Nginx
# RUN ln -s /etc/nginx/modsec/modsecurity.conf /etc/nginx/modsec/modsecurity-enabled.conf

COPY tools/proxy.sh /usr/local/bin/proxy.sh
RUN chmod +x /usr/local/bin/proxy.sh

CMD ["/usr/local/bin/proxy.sh"]
