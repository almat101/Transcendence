all : up

up :
	docker compose -f docker-compose.yml up --build

down :
	docker compose -f docker-compose.yml down

start :
	docker compose -f docker-compose.yml start

stop :
	docker compose -f docker-compose.yml stop

#stop and remove all docker volumes
clean :
	docker compose -f docker-compose.yml down -v

#clean the local volume binded to host folder
lv-clean:
	sudo rm -rf /home/${USER}/Desktop/Transcendence/proxy/logs/*
#	sudo rm -rf /home/${USER}/data/postgres/
#	sudo rm -rf /home/${USER}/data/postgres_grafana/

fclean:
	docker compose -f docker-compose.yml down -v --rmi all --remove-orphans

re: down up

prune :
	docker system prune -af --volumes

ps :
	docker compose -f docker-compose.yml ps --all

images :
	docker compose -f docker-compose.yml images

exec :
	docker exec -it $(C) /bin/bash || true

list-all :
	docker ps -a

list-all-id :
	docker ps -a -q

.PHONY: all up down start stop clean lv-clean fclean re prune ps images exec logs list-all list-all-id

# create-dirs:
# 	@echo "Creating directories"
# 	mkdir -p /home/${USER}/data/postgres_test/
# 	mkdir -p /home/${USER}/data/postgres_grafana/


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
