FROM nginx:latest

# Install ModSecurity dependencies
RUN apt-get update && apt-get install -y \
	&& rm -rf /var/lib/apt/lists/*

# Copy Nginx configuration
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Optional: Add an entrypoint for runtime customization
COPY tools/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/nginxscript.sh"]
