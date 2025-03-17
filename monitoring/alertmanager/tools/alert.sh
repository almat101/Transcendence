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
    icon_url: https://avatars3.githubusercontent.com/u/3380462
    title: |-
     [{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .CommonLabels.alertname }} for {{ .CommonLabels.job }}
     {{- if gt (len .CommonLabels) (len .GroupLabels) -}}
       {{" "}}(
       {{- with .CommonLabels.Remove .GroupLabels.Names }}
         {{- range $index, $label := .SortedPairs -}}
           {{ if $index }}, {{ end }}
           {{- $label.Name }}="{{ $label.Value -}}"
         {{- end }}
       {{- end -}}
       )
     {{- end }}
    text: >-
      {{ range .Alerts -}}
      *Alert:* {{ .Annotations.title }}{{ if .Labels.severity }} - \`{{ .Labels.severity }}\`{{ end }}

      *Description:* {{ .Annotations.description }}

      *Details:*
        {{ range .Labels.SortedPairs }} • *{{ .Name }}:* \`{{ .Value }}\`
        {{ end }}
      {{ end }}

EOL

echo "alertmanager.yml has been created at /etc/alertmanager/alertmanager.yml"

#start the alertmanager service
exec /bin/alertmanager "$@"