all : create-dirs up

up :
	docker compose -f srcs/docker-compose.yml up --build

down :
	docker compose -f srcs/docker-compose.yml down

start :
	docker compose -f srcs/docker-compose.yml start

stop :
	docker compose -f srcs/docker-compose.yml stop

#clean the docker named volume
# v-clean : down
# 	docker compose -f srcs/docker-compose.yml down -v

#clean the local volume binded to this folder
lv-clean: down
	sudo rm -rf /home/${USER}/data/postgres/
	rm -rf /home/${USER}/Desktop/Transcendence/srcs/proxy/logs/*

fclean:
	docker compose -f srcs/docker-compose.yml down -v --rmi all --remove-orphans

re: down up

prune :
	docker system prune -af --volumes

ps :
	docker compose -f srcs/docker-compose.yml ps --all

images :
	docker compose -f srcs/docker-compose.yml images

exec :
	docker exec -it $(C) /bin/bash || true

logs :
	docker logs $(C)

list-all :
	docker ps -a

list-all-id :
	docker ps -a -q

create-dirs:
	@echo "Creating directories for test_postgres"
	mkdir -p /home/${USER}/data/postgres/

# all: down prune build up

# down:
# 	@docker-compose down

# prune:
# 	@docker volume prune -f
# 	@docker image prune -a -f

# build:
# 	@docker-compose build --no-cache

# up:
# 	@docker-compose up -d

# clean: down prune

# fclean: clean
# 	@docker-compose down --rmi all
