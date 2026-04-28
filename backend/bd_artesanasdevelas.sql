--
-- PostgreSQL database dump
--

\restrict Ow8ae5PrXZ28Idjfqh0ItAe6srM4HLXrs7odPOkyVJD2QzYd3mUHGIp6uae2pWm

-- Dumped from database version 17.8 (130b160)
-- Dumped by pg_dump version 17.9

-- Started on 2026-04-28 08:51:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 32801)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 910 (class 1247 OID 32780)
-- Name: direccion; Type: TYPE; Schema: public; Owner: db_manuel
--

CREATE TYPE public.direccion AS (
	calle text,
	numero numeric,
	cp numeric,
	ciudad text,
	provincia text,
	piso text
);


ALTER TYPE public.direccion OWNER TO db_manuel;

--
-- TOC entry 913 (class 1247 OID 32783)
-- Name: persona; Type: TYPE; Schema: public; Owner: db_manuel
--

CREATE TYPE public.persona AS (
	nombre text,
	direccion public.direccion,
	correo text,
	telefono text
);


ALTER TYPE public.persona OWNER TO db_manuel;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 229 (class 1259 OID 40970)
-- Name: aroma; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.aroma (
    id integer NOT NULL,
    nombre_aroma text
);


ALTER TABLE public.aroma OWNER TO db_manuel;

--
-- TOC entry 228 (class 1259 OID 40969)
-- Name: aroma_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.aroma_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aroma_id_seq OWNER TO db_manuel;

--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 228
-- Name: aroma_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.aroma_id_seq OWNED BY public.aroma.id;


--
-- TOC entry 235 (class 1259 OID 57349)
-- Name: cambiar_password; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.cambiar_password (
    id integer NOT NULL,
    id_usuario integer NOT NULL,
    codigo text NOT NULL,
    expira_en timestamp with time zone NOT NULL,
    usado boolean DEFAULT false
);


ALTER TABLE public.cambiar_password OWNER TO db_manuel;

--
-- TOC entry 234 (class 1259 OID 57348)
-- Name: cambiar_password_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.cambiar_password_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cambiar_password_id_seq OWNER TO db_manuel;

--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 234
-- Name: cambiar_password_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.cambiar_password_id_seq OWNED BY public.cambiar_password.id;


--
-- TOC entry 227 (class 1259 OID 40961)
-- Name: categoria; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.categoria (
    id integer NOT NULL,
    nombre_categoria text
);


ALTER TABLE public.categoria OWNER TO db_manuel;

--
-- TOC entry 226 (class 1259 OID 40960)
-- Name: categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.categoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_id_seq OWNER TO db_manuel;

--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 226
-- Name: categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.categoria_id_seq OWNED BY public.categoria.id;


--
-- TOC entry 231 (class 1259 OID 40979)
-- Name: color; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.color (
    id integer NOT NULL,
    color text
);


ALTER TABLE public.color OWNER TO db_manuel;

--
-- TOC entry 230 (class 1259 OID 40978)
-- Name: color_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.color_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.color_id_seq OWNER TO db_manuel;

--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 230
-- Name: color_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.color_id_seq OWNED BY public.color.id;


--
-- TOC entry 242 (class 1259 OID 90114)
-- Name: detalle_pedido; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.detalle_pedido (
    id integer NOT NULL,
    id_pedido integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio numeric(10,2) NOT NULL
);


ALTER TABLE public.detalle_pedido OWNER TO db_manuel;

--
-- TOC entry 241 (class 1259 OID 90113)
-- Name: detalle_pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.detalle_pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_id_seq OWNER TO db_manuel;

--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 241
-- Name: detalle_pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.detalle_pedido_id_seq OWNED BY public.detalle_pedido.id;


--
-- TOC entry 225 (class 1259 OID 32897)
-- Name: pedido; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.pedido (
    id integer NOT NULL,
    direccion public.direccion,
    id_usuario integer,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    nombre character varying(30) NOT NULL,
    correo character varying(30) NOT NULL,
    telefono numeric,
    fecha_creacion timestamp without time zone DEFAULT (now() AT TIME ZONE 'Europe/Madrid'::text),
    estado character varying(30) DEFAULT 'pago_pendiente'::character varying NOT NULL,
    metodo_pago character varying(20) DEFAULT 'paypal'::character varying,
    id_transaccion character varying(100),
    CONSTRAINT pedido_estado_check CHECK (((estado)::text = ANY (ARRAY['pago_pendiente'::text, 'pendiente'::text, 'en_elaboracion'::text, 'enviado'::text, 'entregado'::text, 'cancelado'::text]))),
    CONSTRAINT pedido_metodo_pago_check CHECK (((metodo_pago)::text = ANY (ARRAY['paypal'::text, 'stripe'::text, 'redsys'::text, 'transferencia'::text])))
);


ALTER TABLE public.pedido OWNER TO db_manuel;

--
-- TOC entry 224 (class 1259 OID 32896)
-- Name: pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_id_seq OWNER TO db_manuel;

--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 224
-- Name: pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.pedido_id_seq OWNED BY public.pedido.id;


--
-- TOC entry 240 (class 1259 OID 81925)
-- Name: pedido_personalizado; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.pedido_personalizado (
    id integer NOT NULL,
    id_producto integer,
    id_usuario integer,
    descripcion text NOT NULL,
    nombre text NOT NULL,
    correo text NOT NULL,
    telefono text,
    fecha_creacion timestamp without time zone DEFAULT (now() AT TIME ZONE 'Europe/Madrid'::text),
    cantidad numeric NOT NULL,
    estado character varying(30) DEFAULT 'pendiente'::character varying NOT NULL,
    CONSTRAINT pedido_personalizado_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aceptado'::character varying, 'denegado'::character varying, 'completado'::character varying])::text[])))
);


ALTER TABLE public.pedido_personalizado OWNER TO db_manuel;

--
-- TOC entry 239 (class 1259 OID 81924)
-- Name: pedido_personalizado_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.pedido_personalizado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_personalizado_id_seq OWNER TO db_manuel;

--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 239
-- Name: pedido_personalizado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.pedido_personalizado_id_seq OWNED BY public.pedido_personalizado.id;


--
-- TOC entry 219 (class 1259 OID 32770)
-- Name: producto; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.producto (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    precio double precision NOT NULL,
    stock numeric NOT NULL,
    oferta numeric NOT NULL,
    precio_oferta double precision NOT NULL,
    categoria integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.producto OWNER TO db_manuel;

--
-- TOC entry 233 (class 1259 OID 41005)
-- Name: producto_aroma; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.producto_aroma (
    id_producto integer NOT NULL,
    id_aroma integer NOT NULL
);


ALTER TABLE public.producto_aroma OWNER TO db_manuel;

--
-- TOC entry 232 (class 1259 OID 40992)
-- Name: producto_color; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.producto_color (
    id_producto integer,
    id_color integer
);


ALTER TABLE public.producto_color OWNER TO db_manuel;

--
-- TOC entry 218 (class 1259 OID 32769)
-- Name: producto_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_id_seq OWNER TO db_manuel;

--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 218
-- Name: producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.producto_id_seq OWNED BY public.producto.id;


--
-- TOC entry 237 (class 1259 OID 65537)
-- Name: producto_imagen; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.producto_imagen (
    id integer NOT NULL,
    id_producto integer NOT NULL,
    imagen bytea NOT NULL,
    orden integer DEFAULT 0,
    imagen_mime text NOT NULL
);


ALTER TABLE public.producto_imagen OWNER TO db_manuel;

--
-- TOC entry 236 (class 1259 OID 65536)
-- Name: producto_imagen_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.producto_imagen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_imagen_id_seq OWNER TO db_manuel;

--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 236
-- Name: producto_imagen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.producto_imagen_id_seq OWNED BY public.producto_imagen.id;


--
-- TOC entry 238 (class 1259 OID 65551)
-- Name: tokens_invalidados; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.tokens_invalidados (
    token text NOT NULL,
    invalidado_en timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tokens_invalidados OWNER TO db_manuel;

--
-- TOC entry 223 (class 1259 OID 32792)
-- Name: usuario; Type: TABLE; Schema: public; Owner: db_manuel
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    persona public.persona,
    password text NOT NULL,
    tipo numeric(2,0) DEFAULT 2 NOT NULL
);


ALTER TABLE public.usuario OWNER TO db_manuel;

--
-- TOC entry 222 (class 1259 OID 32791)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: db_manuel
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO db_manuel;

--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 222
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: db_manuel
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 3323 (class 2604 OID 40973)
-- Name: aroma id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.aroma ALTER COLUMN id SET DEFAULT nextval('public.aroma_id_seq'::regclass);


--
-- TOC entry 3325 (class 2604 OID 57352)
-- Name: cambiar_password id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.cambiar_password ALTER COLUMN id SET DEFAULT nextval('public.cambiar_password_id_seq'::regclass);


--
-- TOC entry 3322 (class 2604 OID 40964)
-- Name: categoria id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id SET DEFAULT nextval('public.categoria_id_seq'::regclass);


--
-- TOC entry 3324 (class 2604 OID 40982)
-- Name: color id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.color ALTER COLUMN id SET DEFAULT nextval('public.color_id_seq'::regclass);


--
-- TOC entry 3333 (class 2604 OID 90117)
-- Name: detalle_pedido id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.detalle_pedido ALTER COLUMN id SET DEFAULT nextval('public.detalle_pedido_id_seq'::regclass);


--
-- TOC entry 3317 (class 2604 OID 32900)
-- Name: pedido id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id SET DEFAULT nextval('public.pedido_id_seq'::regclass);


--
-- TOC entry 3330 (class 2604 OID 81928)
-- Name: pedido_personalizado id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.pedido_personalizado ALTER COLUMN id SET DEFAULT nextval('public.pedido_personalizado_id_seq'::regclass);


--
-- TOC entry 3313 (class 2604 OID 32773)
-- Name: producto id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto ALTER COLUMN id SET DEFAULT nextval('public.producto_id_seq'::regclass);


--
-- TOC entry 3327 (class 2604 OID 65540)
-- Name: producto_imagen id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_imagen ALTER COLUMN id SET DEFAULT nextval('public.producto_imagen_id_seq'::regclass);


--
-- TOC entry 3315 (class 2604 OID 32795)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 3346 (class 2606 OID 40977)
-- Name: aroma aroma_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.aroma
    ADD CONSTRAINT aroma_pkey PRIMARY KEY (id);


--
-- TOC entry 3352 (class 2606 OID 57357)
-- Name: cambiar_password cambiar_password_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.cambiar_password
    ADD CONSTRAINT cambiar_password_pkey PRIMARY KEY (id);


--
-- TOC entry 3344 (class 2606 OID 40968)
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id);


--
-- TOC entry 3348 (class 2606 OID 40986)
-- Name: color color_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.color
    ADD CONSTRAINT color_pkey PRIMARY KEY (id);


--
-- TOC entry 3360 (class 2606 OID 90119)
-- Name: detalle_pedido detalle_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_pkey PRIMARY KEY (id);


--
-- TOC entry 3358 (class 2606 OID 81932)
-- Name: pedido_personalizado pedido_personalizado_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.pedido_personalizado
    ADD CONSTRAINT pedido_personalizado_pkey PRIMARY KEY (id);


--
-- TOC entry 3342 (class 2606 OID 32904)
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id);


--
-- TOC entry 3350 (class 2606 OID 41009)
-- Name: producto_aroma producto_aroma_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_aroma
    ADD CONSTRAINT producto_aroma_pkey PRIMARY KEY (id_producto, id_aroma);


--
-- TOC entry 3354 (class 2606 OID 65545)
-- Name: producto_imagen producto_imagen_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_imagen
    ADD CONSTRAINT producto_imagen_pkey PRIMARY KEY (id);


--
-- TOC entry 3338 (class 2606 OID 32777)
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id);


--
-- TOC entry 3356 (class 2606 OID 65558)
-- Name: tokens_invalidados tokens_invalidados_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.tokens_invalidados
    ADD CONSTRAINT tokens_invalidados_pkey PRIMARY KEY (token);


--
-- TOC entry 3340 (class 2606 OID 32800)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 3367 (class 2606 OID 57358)
-- Name: cambiar_password cambiar_password_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.cambiar_password
    ADD CONSTRAINT cambiar_password_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3371 (class 2606 OID 90120)
-- Name: detalle_pedido detalle_pedido_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id) ON DELETE CASCADE;


--
-- TOC entry 3372 (class 2606 OID 114688)
-- Name: detalle_pedido detalle_pedido_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id) ON DELETE CASCADE;


--
-- TOC entry 3361 (class 2606 OID 114694)
-- Name: producto fk_categoria; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_categoria FOREIGN KEY (categoria) REFERENCES public.categoria(id) ON UPDATE CASCADE ON DELETE SET DEFAULT;


--
-- TOC entry 3362 (class 2606 OID 32910)
-- Name: pedido pedido_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);


--
-- TOC entry 3369 (class 2606 OID 81933)
-- Name: pedido_personalizado pedido_personalizado_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.pedido_personalizado
    ADD CONSTRAINT pedido_personalizado_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id) ON DELETE SET NULL;


--
-- TOC entry 3370 (class 2606 OID 81938)
-- Name: pedido_personalizado pedido_personalizado_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.pedido_personalizado
    ADD CONSTRAINT pedido_personalizado_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- TOC entry 3365 (class 2606 OID 49162)
-- Name: producto_aroma producto_aroma_id_aroma_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_aroma
    ADD CONSTRAINT producto_aroma_id_aroma_fkey FOREIGN KEY (id_aroma) REFERENCES public.aroma(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3366 (class 2606 OID 49152)
-- Name: producto_aroma producto_aroma_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_aroma
    ADD CONSTRAINT producto_aroma_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3363 (class 2606 OID 49167)
-- Name: producto_color producto_color_id_color_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_color
    ADD CONSTRAINT producto_color_id_color_fkey FOREIGN KEY (id_color) REFERENCES public.color(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3364 (class 2606 OID 49157)
-- Name: producto_color producto_color_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_color
    ADD CONSTRAINT producto_color_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3368 (class 2606 OID 65546)
-- Name: producto_imagen producto_imagen_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: db_manuel
--

ALTER TABLE ONLY public.producto_imagen
    ADD CONSTRAINT producto_imagen_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO db_manuel;
GRANT ALL ON SCHEMA public TO db_zineb;


--
-- TOC entry 2148 (class 826 OID 24584)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2147 (class 826 OID 24583)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2146 (class 826 OID 32768)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: db_mauro
--

ALTER DEFAULT PRIVILEGES FOR ROLE db_mauro IN SCHEMA public GRANT ALL ON TABLES TO db_manuel;
ALTER DEFAULT PRIVILEGES FOR ROLE db_mauro IN SCHEMA public GRANT ALL ON TABLES TO db_zineb;


-- Completed on 2026-04-28 08:51:39

--
-- PostgreSQL database dump complete
--

\unrestrict Ow8ae5PrXZ28Idjfqh0ItAe6srM4HLXrs7odPOkyVJD2QzYd3mUHGIp6uae2pWm

