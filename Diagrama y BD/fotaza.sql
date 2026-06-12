-- public.etiquetas definition

-- Drop table

-- DROP TABLE public.etiquetas;

CREATE TABLE public.etiquetas (
	id serial4 NOT NULL,
	nombre varchar(50) NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT etiquetas_nombre_key UNIQUE (nombre),
	CONSTRAINT etiquetas_pkey PRIMARY KEY (id)
);


-- public.publicacion_etiquetas definition

-- Drop table

-- DROP TABLE public.publicacion_etiquetas;

CREATE TABLE public.publicacion_etiquetas (
	publicacion_id int4 NOT NULL,
	etiqueta_id int4 NOT NULL,
	CONSTRAINT publicacion_etiquetas_pkey PRIMARY KEY (publicacion_id, etiqueta_id)
);


-- public.usuarios definition

-- Drop table

-- DROP TABLE public.usuarios;

CREATE TABLE public.usuarios (
	id serial4 NOT NULL,
	nombre_usuario varchar(50) NOT NULL,
	apellido_usuario varchar(50) NULL,
	email varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	rol varchar(20) DEFAULT 'usuario'::character varying NULL,
	estado varchar(20) DEFAULT 'activo'::character varying NULL,
	"createdAt" timestamptz NOT NULL, 
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT usuarios_email_key UNIQUE (email),
	CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);


-- public.colecciones definition

-- Drop table

-- DROP TABLE public.colecciones;

CREATE TABLE public.colecciones (
	id serial4 NOT NULL,
	usuario_id int4 NULL,
	nombre varchar(255) NOT NULL,
	fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT colecciones_pkey PRIMARY KEY (id),
	CONSTRAINT colecciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE
);


-- public.mensajes definition

-- Drop table

-- DROP TABLE public.mensajes;

CREATE TABLE public.mensajes (
	id serial4 NOT NULL,
	emisor_id int4 NOT NULL,
	receptor_id int4 NOT NULL,
	texto text NOT NULL,
	fecha_envio timestamptz NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT mensajes_pkey PRIMARY KEY (id),
	CONSTRAINT mensajes_emisor_id_fkey FOREIGN KEY (emisor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT mensajes_receptor_id_fkey FOREIGN KEY (receptor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- public.publicaciones definition

-- Drop table

-- DROP TABLE public.publicaciones;

CREATE TABLE public.publicaciones (
	id int4 DEFAULT nextval('publicacions_id_seq'::regclass) NOT NULL,
	usuario_id int4 NOT NULL,
	titulo varchar(255) NOT NULL,
	descripcion text NULL,
	estado varchar(30) DEFAULT 'activa'::character varying NULL,
	comentarios_abiertos timestamptz NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT publicacions_pkey PRIMARY KEY (id),
	CONSTRAINT publicaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- public.seguidores definition

-- Drop table

-- DROP TABLE public.seguidores;

CREATE TABLE public.seguidores (
	usuario_seguido_id int4 NOT NULL,
	usuario_seguidor_id int4 NOT NULL,
	fecha_seguimiento timestamptz NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT seguidores_pkey PRIMARY KEY (usuario_seguido_id, usuario_seguidor_id),
	CONSTRAINT seguidores_usuario_seguido_id_fkey FOREIGN KEY (usuario_seguido_id) REFERENCES public.usuarios(id) ON DELETE CASCADE,
	CONSTRAINT seguidores_usuario_seguidor_id_fkey FOREIGN KEY (usuario_seguidor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE
);


-- public.valoraciones definition

-- Drop table

-- DROP TABLE public.valoraciones;

CREATE TABLE public.valoraciones (
	id serial4 NOT NULL,
	usuario_id int4 NOT NULL,
	puntaje int4 NOT NULL,
	publicacion_id int4 NOT NULL,
	me_gusta bool NOT NULL,
	CONSTRAINT valoraciones_pkey PRIMARY KEY (id),
	CONSTRAINT valoraciones_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT valoraciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- public.coleccion_publicaciones definition

-- Drop table

-- DROP TABLE public.coleccion_publicaciones;

CREATE TABLE public.coleccion_publicaciones (
	coleccion_id int4 NOT NULL,
	publicacion_id int4 NOT NULL,
	CONSTRAINT coleccion_publicaciones_pkey PRIMARY KEY (coleccion_id, publicacion_id),
	CONSTRAINT coleccion_publicaciones_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON DELETE CASCADE
);


-- public.comentarios definition

-- Drop table

-- DROP TABLE public.comentarios;

CREATE TABLE public.comentarios (
	id serial4 NOT NULL,
	imagen_id int4 NOT NULL,
	usuario_id int4 NULL,
	texto text NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	publicacion_id int4 NULL,
	CONSTRAINT comentarios_pkey PRIMARY KEY (id),
	CONSTRAINT comentarios_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- public.imagenes definition

-- Drop table

-- DROP TABLE public.imagenes;

CREATE TABLE public.imagenes (
	id serial4 NOT NULL,
	publicacion_id int4 NOT NULL,
	url_imagen text NOT NULL,
	licencia varchar(50) DEFAULT 'sin_copyright'::character varying NULL,
	marca_agua varchar(100) DEFAULT true NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT imagenes_pkey PRIMARY KEY (id),
	CONSTRAINT imagenes_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(id) ON DELETE CASCADE ON UPDATE CASCADE
);