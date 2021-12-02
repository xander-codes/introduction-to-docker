# Introduction to Docker

Agenda:
1. Ce este un container și ce probleme rezolva?
2. Container repo
3. Dezvoltare appilcatii
4. Deploy aplicatii


1. O modalitate de a împacheta o aplicație cu toate dependințele și configurările. Acest pachet este portabil. Face dezvoltarea mai eficienta

2. Unde le gasim? Ele trăiesc în container repositories care este un tip special de storage pt containere.  
   Multe companii au repo private dar exista și unul public DockerHub (go to hub.docker.com) și arata exemple
- cum arata abordarea clasica: o echipa de devi pe diverse sisteme de operare care au nevoie de instalari si configurari 
  locale locale ale tool-urilor de care au nevoie pt dezvoltare (ex: postgres, redis) si procesul de instalare arata 
  diferit in functie de sistemul de operare, care are o gramada de pasi diferiti si sunt sanse mari sa apara erori sau 
  configurari diferite. daca ai 10 servicii de configurat va dati seama cat dureaza
- cu containere nu trebuie sa instalezi nici un program la tine pe calculator direct pt ca containerul este un linux 
  izolat. aici ai totul impachetat in acest mediu izolat. Trebuie doar sa dowloadezi imaginea si s-o pornesti, este 
  aceeasi  comanda indiferent de sistemul de operare pe care esti. daca ai 10 medii pe care trebuie sa le folosesti 
  pt dezvoltare va trebui sa dai 10 comenzi si asta-i tot, ceea ce face setup-ul mult mai usor si mult mai eficient. 
  poti avea versiuni diferite alea aceleiasi aplicatii fara a avea conflicte  	la deployment devii dat catre 
  devops un pachet jar, de exemplu, impreuna cu un set de instructiuni de instalare. si daca e ceva gresit in 
  instructiuni sau ceva este omis  atunci echipa devops va trebui sa intre din nou devii si tot asa 	in schimb, 
  cu containere, echipele lucreaza impreuna sa impacheteze aplicatiaintr-un container, nu au nevoie de nici o 
  configurare de mediu pe server in afara de docker engine apoi dowloadeaza imaginea si o ruleaza. 	Tehnic un 
  container este: este un sistem de straturi de imagini unele peste altele, la baza este de obicei un linux alpine 
  pt ca e mic apoi startul de aplicatie (ex postgres)
  Hands on: go to docker hub, cauta postgres. in terminal dam comanda:  	docker run postgres:9.6
  aici va rula comanda si explic layerele de baza si ca se vor downloada doar straturile diferite

  IMAGE vs CONTAINER
  image = pachetul cu aplicatia, dependintele si configurarile (NOT RUNNING)
  container = atunci cand down imaginea si o rulez (RUNNING)

  rulat din nou comanda
  docker run postgres:10.10
  Acestea sunt ca sa vedeti cum arata in realitate, cum se face si cum se pornesc.

  CONTAINER VS VIRTUAL MACHINE

Docker: Hardware > OS kernel > (Applications)
VM: Hardware > (OS kernel > Applications)
=> marime mai mica a continerelor, viteza mai mare, compatibilitate (poti rula orice OS in VM pe orice OS) dar nu si uc docker pt ca windows nu este compatibil cu linux, ca rezolvare se poate folosi docker toolbox

	Pentru instalare gasiti cate un ghid cuprinzator pe net, n-o sa facem asta acum.

	Docker  commands:
	docker pull redis
	docker images
	docker run redis:alpine - this will run in attached mode
	docker run -d redis:alpine - this runs in detached mode
	docker ps -a
	docker run redis:4.0 - pulls the image and starts it. 2 commands in one

	PORTS:
	explain that poti folosi aceleasi porturi pe containere diferite dar nu poti folosi acelasi port de pe host sa il legi de containere diferite
	daca nu ii setam un port binding nu vom putea acesa si nu vom putea lucra cu acel container
	docker run -d -p 6000:6379 redis:alpine

	COMMANDS for troubleshooting: see the logs or get inside a container
	docker logs [container_id] or [container_name]
	docker run -d -p 6001:6379 --name redis-old redis:4.0 - to specify a name for the container
	docker rename [name_or_id] [new_name]
	docker exec -it [container_id or name] sh - for macos
		inside: env, cd, ls, exit

DEVELOPMENT SCENARIO:
dezvolti o aplicatie js pe localhost is in loc sa instalezi mongo pe local iei o imagine de pe docker hub si faci un 
container. apoi vrei s-o faci disponibila pt testare unui tester din alta tara si faci in felul urm:
workflow: dev > commit on git > care va triggerui un jenkins build si va produce artefacte din aplicatia ta 
si o imagine > imaginea va fi urcata pe un repo privat de imagini > apoi jenkins sau alte tooluri trebuie sa deployeze 
acea imagine pe un development server > acel dev server ia imaginea cu aplicatia, ia mongo de pe docker hub si acum 
avem 2 containere care ruleaza pe dev server: una aplicatia noastra, si una mongo de pe hub si ele discuta intre ele 
si ruleaza ca o aplicatie > acum daca vine testerul poate sa foloseasca aplicatia

voi folosi si mongo-express ca si MongoDB admin interface. ca acestea sa poata merge impreuna ne va trebui o docker network

Steps:
docker network ls
docker network create mongo-network
docker run -d \
-p 27017:27017 \
--net mongo-network \
--name mdb mongo

	docker logs [container_id]

	docker run -d \
	-p 8081:8081 \
	-e ME_CONFIG_MONGODB_SERVER=mdb \
	--net mongo-network \
	--name mongo-express \
	mongo-express

DOCKER COMPOSE:
modalitatea de mai sus este lunga si este foarte posibil sa gresim, exista o alternativa: docker compose. daca ai 10 containere care trebuie sa conlucreze
docker compose va crea automat o retea in care aceste containere sa comunice

	docker-compose up -d [—build] (to trigger a new build)
	docker-compose down

DOCKERFILE
am dezvoltat un feature si suntem gata sa facem deploy, pt asta ar trebui ca aplicatie sa fie impachetata intr-un container 
al sau. Asta inseamna ca va trebui sa construim o imagine din aplicatia noastra
acum ar tb sa facem commit
apoi jenkins face build, adica o impacheteaza intr-o imagine si o sa ii dam push intr-un repository, o sa simulam asta

	dockerfile is a blueprint for building images, il avem deja in proiect, de explicat ce e in el
	ca sa construim efectiv imaginea rulam:

	docker build -t my-app:1.0 .

PRIVATE REPOSITORY:
se poate face cu AWS Elastic Container Registry
ar tb sa se faca push la imagini

DOCKER VOLUMES:
sumt folosite pt persistenta datelor
3 tipuri: host, anonymous, named

exemplu comanda cu named volume:
docker run -d -p 5432:5432 -v pg_data:/var/lib/postgresql/data postgres:9.6

docker volume ls  
docker volume create [name]  
docker volume inspect [name]  
docker run -d -v test_volume:/shared-volume --name test redis:alpine

//pwd intoarce currrent working directory, urmatoarea comanda mapeaza pwd la /app/client din container
//pt sincronizarea fisierelor dintre local si container/pt dezvoltare direct in container
docker run -d -p 6000:6379 -v $PWD:/app/client redis:alpine
docker run -d -p 6000:6379 -v `pwd`:/app/client redis:alpine

docker-compose up -d
docker-compose down


	