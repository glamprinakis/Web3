all:
	sudo docker compose up -d
stop:
	sudo docker compose stop
bash:
	sudo docker exec -it ${id} /bin/bash
db:
	sudo docker exec -i ${id} mysql -uroot -pxyz123 visionstudio < ./visionstudio.sql
down:
	sudo docker compose down
restart:
	sudo docker compose restart
nginx:
	bash nginx.sh