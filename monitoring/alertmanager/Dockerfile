# Use the Alertmanager image
FROM prom/alertmanager:v0.28.1

# Switch to root to copy and set permissions
USER root
COPY tools/alert.sh /etc/alertmanager/alert.sh
RUN chmod +x /etc/alertmanager/alert.sh

# Switch back to the default user
USER nobody

# Run the script and then start Alertmanager
ENTRYPOINT ["/bin/sh", "/etc/alertmanager/alert.sh"]

# Default arguments for Alertmanager
CMD ["--config.file=/etc/alertmanager/alertmanager.yml"]