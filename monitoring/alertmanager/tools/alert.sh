#!/bin/sh

# Ensure the SLACK_API_URL environment variable is set
if [ -z "$SLACK_API_URL" ]; then
  echo "Error: SLACK_API_URL environment variable is not set."
  exit 1
fi

# Create the alertmanager.yml file with the SLACK_API_URL from the environment variable
cat << EOL > /etc/alertmanager/alertmanager.yml
global:
  resolve_timeout: 2m
  slack_api_url: '$SLACK_API_URL'

route:
  receiver: 'slack-notifications'

receivers:
- name: 'slack-notifications'
  slack_configs:
  - channel: '#monitoring-instances'
    send_resolved: true
EOL

echo "alertmanager.yml has been created at /etc/alertmanager/alertmanager.yml"

#start the alertmanager service
exec /bin/alertmanager "$@"