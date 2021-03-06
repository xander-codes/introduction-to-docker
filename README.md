# Introduction to Docker

Agenda:
1. Ce este un container și ce probleme rezolva?
2. Container repo
3. Dezvoltare aplicatii
4. Deploy aplicatii


1. O modalitate de a împacheta o aplicație cu toate dependințele și configurările. Acest pachet este portabil. Face dezvoltarea mai eficienta.

2. Unde le gasim? Ele trăiesc în container repositories care este un tip special de storage pt containere.  
   Multe companii au repo private dar exista și unul public Docker Hub (http://hub.docker.com)
- Cum arata abordarea clasica: o echipa de dezvoltatori pe diverse sisteme de operare care au nevoie de instalari si configurari 
  locale ale tool-urilor cu care lucreaza (ex: postgres, redis, node) si procesul de instalare arata 
  diferit in functie de sistemul de operare, care are o multitudine de pasi diferiti si sunt sanse mari sa apara erori sau 
  configurari diferite. Cu cat numarul serviciilor de configurat creste cu atat creste si timpul necesar acestor configurari, 
  complexitatea procesului si sansele de eroare.
- Folosind containere nu este nevoie de instalare locala deoarece toate programele se vor instala in container. Aici ai 
  totul impachetat in acest mediu izolat. Trebuie doar downloadata imaginea si pornita, se foloseste 
  aceeasi comanda de terminal indiferent de sistemul de operare pe care se lucreaza. Daca sunt 10 medii de folosit 
  pt dezvoltare vor trebui date 10 comenzi. Ceea ce face setup-ul mult mai usor si mai eficient. 
  Pot co-exista versiuni diferite alea aceleiasi aplicatii fara conflicte. De exemplu, la deployment dezvoltatorii dau catre 
  devops un pachet jar impreuna cu un set de instructiuni de instalare. Daca e ceva gresit in instructiuni sau ceva este omis
  atunci echipa devops va trebui sa clarifice cu echipa de dezvoltare si tot asa. In schimb, cu containere, echipele lucreaza 
  impreuna sa impacheteze aplicatia intr-unul sau mai multe containere, nu au nevoie de nici o 
  configurare de mediu pe server in afara de docker engine apoi dowloadeaza imaginea si o ruleaza.  
  Tehnic un container este: este un sistem de straturi de imagini, la baza este de obicei un linux alpine pt ca are dimensiune mica
  apoi starturile de aplicatii (ex postgres)
  Hands on: go to docker hub, cauta postgres.  
  In terminal dam comanda:  
  ```docker run postgres:9.6```

  IMAGE vs CONTAINER
  image = pachetul cu aplicatia, dependintele si configurarile (NOT RUNNING)
  container = atunci cand downloadam imaginea si o ruleam (RUNNING)

  ```docker run postgres:10.10```

  CONTAINER VS VIRTUAL MACHINE

  Docker: Hardware > OS kernel > (Applications)
  VM: Hardware > (OS kernel > Applications) => marime mai mica a continerelor, viteza mai mare, compatibilitate 
  (orice OS in VM pe orice OS) dar nu si cu docker pt ca windows nu este compatibil cu linux, 
  ca rezolvare se poate folosi Docker Toolbox

  Pentru instalare gasiti cate un ghid cuprinzator pe net, n-o sa facem asta acum.

#### Docker  commands:  
    
  ```docker pull redis```  
  ```docker images```  
  ```docker run redis:alpine```   // this will run in attached mode  
  ```docker run -d redis:alpine```   // this runs in detached mode  
  ```docker ps -a```  
  ```docker run redis:4.0```   // pulls the image and starts it. 2 commands in one  
  
#### PORTS:
  Se pot folosi aceleasi porturi pe containere diferite dar nu se pot folosi acelasi port de pe host legat de containere diferite
  daca nu setam un port binding nu vom putea acesa si nu vom putea lucra cu acel container  
  ```docker run -d -p 6000:6379 redis:alpine```
  
  commands for troubleshooting: see the logs or get inside a container
  ```docker logs [container_id] or [container_name]```  
  ```docker run -d -p 6001:6379 --name redis-old redis:4.0``` // to specify a name for the container  
  ```docker rename [name_or_id] [new_name]```  
  ```docker exec -it [container_id or name] sh``` // for macos  
  inside shell: ```env, cd, ls, exit```


#### DEVELOPMENT SCENARIO:
dezvoltam o aplicatie JS pe localhost si in loc sa instalam mongo pe local luam o imagine de pe docker hub si facem un 
container, apoi vrem s-o facem disponibila pt testare unui tester din alta tara.
Pt asta urmam urmatorul workflow: dezvoltare > commit on git > care va triggerui un jenkins build si va produce artefacte din aplicatie
si o imagine > imaginea va fi urcata pe un repo privat de imagini > apoi jenkins sau alte tooluri trebuie sa deployeze 
acea imagine pe un development server > acel dev server ia imaginea cu aplicatia, ia mongo de pe docker hub si acum 
avem 2 containere care ruleaza pe dev server: una aplicatia noastra, si una mongo de pe hub. Cele 2 discuta intre ele 
si ruleaza ca o aplicatie > acum daca vine testerul poate sa foloseasca aplicatia

Vom folosi si mongo-express ca si MongoDB admin interface. Ca acestea sa poata merge impreuna ne va trebui o docker network

Steps:  
```docker network ls```  
```docker network create mongo-network```  
```docker run -d -p 27017:27017 --net mongo-network --name mdb mongo```  
```docker logs [container_id]```  
```docker run -d -p 8081:8081 -e ME_CONFIG_MONGODB_SERVER=mdb --net mongo-network --name mongo-express mongo-express```  

#### DOCKER COMPOSE:
Modalitatea de mai sus este lunga si este foarte posibil sa gresim, exista o alternativa: docker compose. Daca avem 10 
containere care trebuie sa conlucreze 'docker compose' va crea automat o retea in care aceste containere sa comunice

```docker-compose up -d``` // [—build] (to trigger a new build)
```docker-compose down```

#### DOCKERFILE
Am dezvoltat un feature si suntem gata sa facem deploy, pt asta ar trebui ca aplicatie sa fie impachetata intr-un container 
propriu. Asta inseamna ca va trebui sa construim o imagine din aplicatia noastra. Acum ar trebui sa facem commit
apoi jenkins face build, adica o impacheteaza intr-o imagine si o pune intr-un repository.

Dockerfile is a blueprint for building images, il avem deja in proiect. Ca sa construim efectiv imaginea rulam:

```docker build -t [app_name]:1.0 .```

#### PRIVATE REPOSITORY
Se poate face cu AWS Elastic Container Registry si altele asemenea.

#### DOCKER VOLUMES
Sunt folosite pt persistenta datelor.
3 tipuri: host, anonymous, named

exemplu comanda cu named volume:  
```docker run -d -p 5432:5432 -v pg_data:/var/lib/postgresql/data postgres:9.6```

```docker volume ls```   
```docker volume create [name]```  
```docker volume inspect [name]```   
```docker run -d -v test_volume:/shared-volume --name test redis:alpine```  

pwd intoarce currrent working directory, urmatoarea comanda mapeaza pwd la /app/client din container  
pt sincronizarea fisierelor dintre local si container/pt dezvoltare direct in container  
```docker run -d -p 6000:6379 -v $PWD:/app/client redis:alpine```  
```docker run -d -p 6000:6379 -v `pwd`:/app/client redis:alpine```  
	