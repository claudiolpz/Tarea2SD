# Tarea2SD


Para levantar las instancias se debe ejecutar el siguiente comando:
```
docker-compose up --build
```

Una vez inicializadas, se piden las peticiones a través del método POST en las siguientes rutas

```
http://localhost:3000/venta
http://localhost:3000/aviso
http://localhost:3000/registrar

```
con los siguientes body para cada ruta
```
Para Venta: 
{
     "cliente": "chupte",
    "cantidad": 5,
    "stock": 3,
    "hora": "130335",
    "ubicacion": "aca",
    "patente": "patente"

}
Para Registrar:
{
    "nombre":"chupete",
     "apellido":"suazo", 
     "rut":"12223-2",
     "mail":"ssa@gmail.com", 
     "patente":"GHGL", 
     "premium":true
}
Para Aviso:
{
    "ubicacion":"aqui",
    "patente":"GHGL", 
    "estaperdido":false
}

```
Para bajar las instancias se debe ejecutar el siguiente comando:
```
docker-compose down
```
Para eliminar el caché se ejecuta el siguiente comando:
```
docker system prune -a
```
