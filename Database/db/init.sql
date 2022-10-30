create table miembros (
	Nombre varchar(30) not null,
	apellido varchar(30) not null,
	rut varchar(30) not null,
    correo_dueno varchar(220) not null,
    patente_carrito varchar(30) not null,
    IsPremium boolean
);

create table venta (
	cliente varchar(30) not null,
	cantidad_sopaipilla integer not null,
	hora time not null,
	ubicacion varchar(30) not null,
	patente_carrito varchar(30) not null
	
);

