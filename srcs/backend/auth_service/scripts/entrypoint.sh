#!/bin/bash
set -e

# Get secrets from Vault
vault_login() {
    VAULT_TOKEN=$(vault write -field=token auth/approle/login \
        role_id=${VAULT_ROLE_ID} \
        secret_id=${VAULT_SECRET_ID})
    export VAULT_TOKEN
}

get_secrets() {
    vault_login
    SECRETS=$(vault kv get -format=json secret/auth-service/config)
    export DB_USER=$(echo $SECRETS | jq -r .data.data.db_user)
    export DB_PASSWORD=$(echo $SECRETS | jq -r .data.data.db_password)
    export DB_NAME=$(echo $SECRETS | jq -r .data.data.db_name)
    export DJANGO_SECRET_KEY=$(echo $SECRETS | jq -r .data.data.django_secret_key)
}

# Get secrets and start application
get_secrets
#python manage.py migrate
#python manage.py runserver 0.0.0.0:8000
