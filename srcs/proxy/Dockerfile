FROM nginx:latest

# Install ModSecurity dependencies
RUN apt-get update && apt-get install -y \
	libmodsecurity3 \
	libnginx-mod-security \
	modsecurity-crs \
	&& rm -rf /var/lib/apt/lists/*

# Copy ModSecurity config and CRS rules
COPY modsecurity/modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY modsecurity/crs/ /etc/nginx/modsec/crs/

# Copy Nginx configuration
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Enable ModSecurity in Nginx
RUN ln -s /etc/nginx/modsec/modsecurity.conf /etc/nginx/modsec/modsecurity-enabled.conf

# Optional: Add an entrypoint for runtime customization
COPY tools/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 443
EXPOSE 443

CMD ["/usr/local/bin/nginxscript.sh"]
