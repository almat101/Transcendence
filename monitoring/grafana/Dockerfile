FROM debian:bullseye

# Install necessary packages
RUN apt update && apt -y upgrade && apt -y install wget vim adduser libfontconfig1 musl

# Download and install Grafana
RUN wget https://dl.grafana.com/enterprise/release/grafana-enterprise_11.3.0+security~01_amd64.deb
RUN dpkg -i grafana-enterprise_11.3.0+security~01_amd64.deb
RUN rm -rf grafana-enterprise_11.3.0+security~01_amd64.deb

# Remove default grafana.ini
RUN rm -rf /etc/grafana/grafana.ini

# Copy custom grafana.ini
COPY /conf/grafana.ini /etc/grafana/grafana.ini

# Copy custom dashboards
COPY /dashboards /var/lib/grafana/dashboards

# Copy provisioning files
COPY /provisioning /etc/grafana/provisioning

#set permissions to grafana user (for security reason the grafana server was running as root)
RUN chown -R grafana:grafana /var/lib/grafana /var/log/grafana /etc/grafana

# Switch to Grafana user (for security reason the grafana server now runs as grafana user)
USER grafana

# Start Grafana server
CMD ["/usr/sbin/grafana-server", "--config=/etc/grafana/grafana.ini", "--homepath=/usr/share/grafana", "--packaging=docker", "cfg:default.paths.logs=/var/log/grafana", "cfg:default.paths.data=/var/lib/grafana", "cfg:default.paths.plugins=/var/lib/grafana/plugins"]