#!/bin/bash

if [ x${ELASTIC_PASSWORD} == x ]; then
  echo "Set the ELASTIC_PASSWORD!";
  exit 1;
elif [ x${KIBANA_PASSWORD} == x ]; then
  echo "Set the KIBANA_PASSWORD!";
  exit 1;
fi;

if [ ! -f config/certs/ca.zip ]; then
  echo "Creating CA certs";
  bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
  unzip config/certs/ca.zip -d config/certs;
fi;

if [ ! -f config/certs/certs.zip ]; then
  echo "Creating certs";
  echo -ne \
  "instances:\n"\
  "  - name: es01\n"\
  "    dns:\n"\
  "      - es01\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  "  - name: kibana\n"\
  "    dns:\n"\
  "      - kibana\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  > config/certs/instances.yml;
  bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
  unzip config/certs/certs.zip -d config/certs;
fi;

echo "Setting file permissions"
chown -R root:root config/certs;
find . -type d -exec chmod 750 \{\} \;;
find . -type f -exec chmod 640 \{\} \;;

echo "Waiting for Elasticsearch availability";
until curl -s --cacert config/certs/ca/ca.crt https://es01:9200 | grep -E "missing authentication credentials"; do sleep 20; done;
echo "Setting kibana_system password";
until curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://es01:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;


echo "All done with security setup!";

# Now set up ILM policy and index template

echo "Setting up ILM policy...";
curl -X PUT "https://es01:9200/_ilm/policy/nginx_logs_policy" \
  -H "Content-Type: application/json" \
  -u elastic:${ELASTIC_PASSWORD} --cacert config/certs/ca/ca.crt \
  -d @config/elastic/nginx_logs_policy.json

echo "ILM policy created.";

echo "Setting up index template...";
curl -X PUT "https://es01:9200/_index_template/nginx_index_template" \
  -H "Content-Type: application/json" \
  -u elastic:${ELASTIC_PASSWORD} --cacert config/certs/ca/ca.crt \
  -d @config/elastic/nginx_index_template.json
echo "Index template created. Setup complete!";

sleep 15;

# echo "Importing nginx Dashboard..."
# curl -X POST "https://kibana:5601/kibana/api/saved_objects/_import" \
#   -H "kbn-xsrf: true" \
#   --form "file=@/usr/share/elasticsearch/config/elastic/dashboard.ndjson" \
#   -u elastic:${ELASTIC_PASSWORD} --cacert config/certs/ca/ca.crt -k
# echo "Nginx dashboard imported!"

echo "Importing nginx Dashboard..."
curl -X POST "https://kibana:5601/kibana/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  --form "file=@/usr/share/elasticsearch/config/elastic/dashboard_3.ndjson" \
  -u elastic:${ELASTIC_PASSWORD} --cacert config/certs/ca/ca.crt -k
echo "Nginx dashboard imported!"

sleep 10

# tail -f /dev/null;
