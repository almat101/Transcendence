all: down prune build up

down:
	@docker-compose down

prune:
	@docker volume prune -f
	@docker image prune -a -f

build:
	@docker-compose build --no-cache

up:
	@docker-compose up -d

clean: down prune

fclean: clean
	@docker-compose down --rmi all
