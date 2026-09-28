--
-- PostgreSQL database dump
--

-- Dumped from database version 16.15
-- Dumped by pg_dump version 17.0

-- Started on 2026-09-28 16:35:24

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

ALTER TABLE ONLY public.band_bookings DROP CONSTRAINT "FK_band_bookings_contact_id";
ALTER TABLE ONLY public.user_contacts DROP CONSTRAINT "FK_a81491e712124db8d5423803ecb";
ALTER TABLE ONLY public.band_members DROP CONSTRAINT "FK_81b938e7acde458606288b2074c";
ALTER TABLE ONLY public.band_setlist_songs DROP CONSTRAINT "FK_789c4ba2fa81c05fa267f300c47";
ALTER TABLE ONLY public.band_members DROP CONSTRAINT "FK_76323f3340f50cef8abadae5ad3";
ALTER TABLE ONLY public.band_setlist_songs DROP CONSTRAINT "FK_71ee595088904ad13870acfd6f6";
ALTER TABLE ONLY public.band_bookings DROP CONSTRAINT "FK_6c98b6ca9cb8c3f44c94f7f9ad5";
ALTER TABLE ONLY public.band_songs DROP CONSTRAINT "FK_33d198222d4286369d8290ae4de";
ALTER TABLE ONLY public.band_setlists DROP CONSTRAINT "FK_2743ec366c465ce5924fd8b4c18";
DROP INDEX public."IDX_user_contacts_user_id";
DROP INDEX public."IDX_band_songs_band_id";
DROP INDEX public."IDX_band_setlists_band_id";
DROP INDEX public."IDX_band_setlist_songs_band_setlist_id";
DROP INDEX public."IDX_band_members_user_id";
DROP INDEX public."IDX_band_bookings_contact_id";
DROP INDEX public."IDX_band_bookings_band_id";
ALTER TABLE ONLY public.users DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3";
ALTER TABLE ONLY public.band_setlists DROP CONSTRAINT "PK_f5ef8edb8f5427302f26c08ea3a";
ALTER TABLE ONLY public.band_members DROP CONSTRAINT "PK_e825dc62aa9ce798cc5a9e0cf6e";
ALTER TABLE ONLY public.band_bookings DROP CONSTRAINT "PK_c9087b7ed1a6b26f0278bffa11f";
ALTER TABLE ONLY public.user_contacts DROP CONSTRAINT "PK_c7048d25b5fda1fa70501fac9ca";
ALTER TABLE ONLY public.users DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE ONLY public.bands DROP CONSTRAINT "PK_9355783ed6ad7f73a4d6fe50ea1";
ALTER TABLE ONLY public.migrations DROP CONSTRAINT "PK_8c82d7f526340ab734260ea46be";
ALTER TABLE ONLY public.band_songs DROP CONSTRAINT "PK_16d33bd3eb2690a651d5333cf01";
ALTER TABLE ONLY public.band_setlist_songs DROP CONSTRAINT "PK_057daf4e0feaa52a77dbb403afd";
ALTER TABLE public.migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE public.users;
DROP TABLE public.user_contacts;
DROP SEQUENCE public.migrations_id_seq;
DROP TABLE public.migrations;
DROP TABLE public.bands;
DROP TABLE public.band_songs;
DROP TABLE public.band_setlists;
DROP TABLE public.band_setlist_songs;
DROP TABLE public.band_members;
DROP TABLE public.band_bookings;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16623)
-- Name: band_bookings; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.band_bookings (
    id uuid NOT NULL,
    band_id uuid NOT NULL,
    title character varying NOT NULL,
    date date NOT NULL,
    start_time character varying(5) NOT NULL,
    duration character varying NOT NULL,
    fee numeric(10,2) NOT NULL,
    status character varying DEFAULT 'Pending'::character varying NOT NULL,
    consumption character varying,
    link character varying,
    note character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    contact_id uuid NOT NULL
);


ALTER TABLE public.band_bookings OWNER TO band_tools;

--
-- TOC entry 219 (class 1259 OID 16556)
-- Name: band_members; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.band_members (
    band_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_owner boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.band_members OWNER TO band_tools;

--
-- TOC entry 222 (class 1259 OID 16605)
-- Name: band_setlist_songs; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.band_setlist_songs (
    id uuid NOT NULL,
    band_setlist_id uuid NOT NULL,
    band_song_id uuid NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.band_setlist_songs OWNER TO band_tools;

--
-- TOC entry 221 (class 1259 OID 16590)
-- Name: band_setlists; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.band_setlists (
    id uuid NOT NULL,
    band_id uuid NOT NULL,
    name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.band_setlists OWNER TO band_tools;

--
-- TOC entry 220 (class 1259 OID 16575)
-- Name: band_songs; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.band_songs (
    id uuid NOT NULL,
    band_id uuid NOT NULL,
    title character varying NOT NULL,
    tuning character varying,
    tonality character varying,
    bpm integer,
    duration integer,
    lyrics text,
    notes character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.band_songs OWNER TO band_tools;

--
-- TOC entry 217 (class 1259 OID 16534)
-- Name: bands; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.bands (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    genre character varying DEFAULT 'Heavy Metal'::character varying NOT NULL,
    description character varying,
    state character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    neighborhood character varying(255) NOT NULL,
    address character varying(500) NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    image character varying,
    started_at date NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.bands OWNER TO band_tools;

--
-- TOC entry 216 (class 1259 OID 16526)
-- Name: migrations; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO band_tools;

--
-- TOC entry 215 (class 1259 OID 16525)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: band_tools
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO band_tools;

--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 215
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: band_tools
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 224 (class 1259 OID 16639)
-- Name: user_contacts; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.user_contacts (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    phone character varying(11) NOT NULL,
    alternate_phone character varying(11),
    venue_name character varying NOT NULL,
    address character varying NOT NULL,
    email character varying(254) NOT NULL,
    role character varying NOT NULL,
    notes character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_contacts OWNER TO band_tools;

--
-- TOC entry 218 (class 1259 OID 16545)
-- Name: users; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(11) NOT NULL,
    password character varying(60) NOT NULL,
    avatar text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO band_tools;

--
-- TOC entry 3333 (class 2604 OID 16529)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3541 (class 0 OID 16623)
-- Dependencies: 223
-- Data for Name: band_bookings; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.band_bookings VALUES ('01a0e8fc-94a4-78fd-b9b4-376a865ba321', '01a0e8fc-93ff-7b44-ad7c-1b39091b9829', 'Show Bar do Zé 1790615262325.xqpmxhrfk3p', '2026-09-28', '16:07', '1 hora', 800.00, 'Pending', NULL, NULL, NULL, '2026-09-28 17:07:42.372+00', '2026-09-28 17:07:42.372+00', '01a0e8fc-9441-7593-be41-012b4ad9d378');
INSERT INTO public.band_bookings VALUES ('01a0e8fc-952a-7437-8a03-b8c09f288895', '01a0e8fc-93ff-7b44-ad7c-1b39091b9829', 'Show Bar do Zé 1790615262422.ywsr7ztpq7', '2026-09-28', '16:07', '1 hora', 800.00, 'Pending', 'Consumação mínima de R$ 50,00 por pessoa', 'https://instagram.com/bardoze', 'Levar equipamento de som próprio', '2026-09-28 17:07:42.506+00', '2026-09-28 17:07:42.506+00', '01a0e8fc-9441-7593-be41-012b4ad9d378');
INSERT INTO public.band_bookings VALUES ('01a0e8fc-9565-76c4-b8bd-1ee199b7590c', '01a0e8fc-93ff-7b44-ad7c-1b39091b9829', 'Show Bar do Zé 1790615262534.5d4kqkm0n5a', '2026-09-28', '16:07', '1 hora', 800.00, 'Pending', NULL, NULL, NULL, '2026-09-28 17:07:42.565+00', '2026-09-28 17:07:42.565+00', '01a0e8fc-9441-7593-be41-012b4ad9d378');
INSERT INTO public.band_bookings VALUES ('01a0e8fc-95a2-778e-97ef-d7f14ecebecb', '01a0e8fc-93ff-7b44-ad7c-1b39091b9829', 'Show Bar do Zé 1790615262597.5oq11i2hega', '2026-09-28', '16:07', '1 hora', 0.00, 'Pending', NULL, NULL, NULL, '2026-09-28 17:07:42.626+00', '2026-09-28 17:07:42.626+00', '01a0e8fc-9441-7593-be41-012b4ad9d378');
INSERT INTO public.band_bookings VALUES ('01a0e8fc-98f6-72f1-a942-60cd9f7b4f5b', '01a0e8fc-93ff-7b44-ad7c-1b39091b9829', 'Show Bar do Zé 1790615263456.ag53gn8mvl6', '2026-09-28', '16:07', '1 hora', 800.00, 'Pending', NULL, NULL, NULL, '2026-09-28 17:07:43.478+00', '2026-09-28 17:07:43.478+00', '01a0e8fc-9441-7593-be41-012b4ad9d378');
INSERT INTO public.band_bookings VALUES ('01a0e8fc-9955-70fe-ba6a-c9e56b86ab9a', '01a0e8fc-93ff-7b44-ad7c-1b39091b9829', 'Show Bar do Zé 1790615263550.w1vgcxjhg6n', '2026-09-28', '15:07', '1 hora', 800.00, 'Pending', NULL, NULL, NULL, '2026-09-28 17:07:43.573+00', '2026-09-28 17:07:43.573+00', '01a0e8fc-9441-7593-be41-012b4ad9d378');


--
-- TOC entry 3537 (class 0 OID 16556)
-- Dependencies: 219
-- Data for Name: band_members; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.band_members VALUES ('01a088e3-8eff-75f0-946e-2b9266c722a0', '01a088df-1545-74c4-9266-c5c33942e835', true, '2026-09-10 01:16:49.796+00', '2026-09-10 01:16:49.796+00');
INSERT INTO public.band_members VALUES ('01a0e8d0-9a74-79da-a631-dccf18393a1d', '01a088df-1545-74c4-9266-c5c33942e835', true, '2026-09-28 16:19:40.282+00', '2026-09-28 16:19:40.282+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-8714-70c4-844a-11667f4fc6b5', '01a0e8fa-86c7-7cc0-9ebc-61121d66f53e', true, '2026-09-28 17:05:27.833+00', '2026-09-28 17:05:27.833+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-87f9-7b46-bba7-bf85a64f0ee3', '01a0e8fa-87b9-7ee7-b7c2-e6fcabcba133', true, '2026-09-28 17:05:28.06+00', '2026-09-28 17:05:28.06+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-88aa-7914-9ac7-7247fcefb608', '01a0e8fa-886a-7b0b-a532-703fc9016ae9', true, '2026-09-28 17:05:28.236+00', '2026-09-28 17:05:28.236+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-8934-7056-a796-69e4b4aa10e5', '01a0e8fa-88f6-72f2-b7c7-5624b853c800', true, '2026-09-28 17:05:28.374+00', '2026-09-28 17:05:28.374+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-89bb-7046-b6eb-ab3578bc372b', '01a0e8fa-897d-7443-ae41-ab078f182b2f', true, '2026-09-28 17:05:28.509+00', '2026-09-28 17:05:28.509+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-8ab3-7bfc-95ba-153002b9baa1', '01a0e8fa-8a75-7421-86a0-a123b2ce6a9e', true, '2026-09-28 17:05:28.757+00', '2026-09-28 17:05:28.757+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-ddba-72d0-b933-94c9fb8f9c19', '01a0e8fa-8b67-700e-9a1c-e4189ac85d02', true, '2026-09-28 17:05:50.013+00', '2026-09-28 17:05:50.013+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-8c26-7843-ba4b-bb8de54f1f1e', '01a0e8fa-ddff-7e8c-8a2e-c17d4aa73c8e', true, '2026-09-28 17:05:29.128+00', '2026-09-28 17:05:29.128+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-8ca1-76e4-bbc7-34feb66e358b', '01a0e8fa-8c65-763a-ba45-f6505a7fa5ad', true, '2026-09-28 17:05:29.252+00', '2026-09-28 17:05:29.252+00');
INSERT INTO public.band_members VALUES ('01a0e8fa-8caa-7989-8b7c-6679c5ad7075', '01a0e8fa-8c65-763a-ba45-f6505a7fa5ad', true, '2026-09-28 17:05:29.26+00', '2026-09-28 17:05:29.26+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-937b-720a-af93-57a2ee57060e', '01a0e8fc-9278-74a9-8885-85e827e1c671', true, '2026-09-28 17:07:42.092+00', '2026-09-28 17:07:42.092+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9383-7a9a-815d-4c4098d104bb', '01a0e8fc-928e-7d6b-a348-f1aef717bc06', true, '2026-09-28 17:07:42.102+00', '2026-09-28 17:07:42.102+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9393-7ff8-9997-7f68a6499a9b', '01a0e8fc-92a2-72be-8f2b-46db0ec7d2c2', true, '2026-09-28 17:07:42.115+00', '2026-09-28 17:07:42.115+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-938b-7306-8825-7c7eaec317ac', '01a0e8fc-9274-73b1-bf9c-40e6a74b5cc6', true, '2026-09-28 17:07:42.112+00', '2026-09-28 17:07:42.112+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-93a4-7de1-bfdb-bbb9624b2745', '01a0e8fc-9297-7147-b32a-c2ae79f0f23d', true, '2026-09-28 17:07:42.132+00', '2026-09-28 17:07:42.132+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-93c5-771e-8661-2f0e0f94a5d8', '01a0e8fc-92a9-78a0-b869-8e36cde7e210', true, '2026-09-28 17:07:42.165+00', '2026-09-28 17:07:42.165+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-93ff-7b44-ad7c-1b39091b9829', '01a0e8fc-930e-7ece-8747-ace16db3c22b', true, '2026-09-28 17:07:42.229+00', '2026-09-28 17:07:42.229+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-95dd-767c-82aa-848336409a8b', '01a0e8fc-94ef-7658-bbd1-d2b86f4b38ef', true, '2026-09-28 17:07:42.697+00', '2026-09-28 17:07:42.697+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-962a-7a5e-a771-7d46ef846284', '01a0e8fc-9556-7259-89f2-906aabe0f3b2', true, '2026-09-28 17:07:42.789+00', '2026-09-28 17:07:42.789+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-96a7-79ae-b6fc-d3cd7164f4c9', '01a0e8fc-9444-78b4-b892-0caafa60c769', true, '2026-09-28 17:07:42.903+00', '2026-09-28 17:07:42.903+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-96f8-7e2d-bc6c-fed78f705371', '01a0e8fc-95cc-7a49-a1f3-f1c23a52cfca', true, '2026-09-28 17:07:42.982+00', '2026-09-28 17:07:42.982+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-96f8-7e2d-bc6c-fed78f705371', '01a0e8fc-9444-78b4-b892-0caafa60c769', false, '2026-09-28 17:07:43.013585+00', '2026-09-28 17:07:43.013585+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-97a7-7a16-b629-6b58672c2a49', '01a0e8fc-96d6-7bd1-b7ea-10e27cfea442', true, '2026-09-28 17:07:43.152+00', '2026-09-28 17:07:43.152+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-97d9-7f9b-9ec2-ff51be5dbf84', '01a0e8fc-96d6-7bd1-b7ea-10e27cfea442', true, '2026-09-28 17:07:43.206+00', '2026-09-28 17:07:43.206+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-97f3-782e-a9a8-0da63ae39f5b', '01a0e8fc-9727-7011-a620-cd65206919ce', true, '2026-09-28 17:07:43.241+00', '2026-09-28 17:07:43.241+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-982b-7d5b-ae63-b3b03ca0be0e', '01a0e8fc-9727-7011-a620-cd65206919ce', true, '2026-09-28 17:07:43.285+00', '2026-09-28 17:07:43.285+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-98e6-7850-bc83-97072ffb945b', '01a0e8fc-92a2-72be-8f2b-46db0ec7d2c2', true, '2026-09-28 17:07:43.477+00', '2026-09-28 17:07:43.477+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-997a-7b30-b330-97de10ab0fc0', '01a0e8fc-92a2-72be-8f2b-46db0ec7d2c2', true, '2026-09-28 17:07:43.62+00', '2026-09-28 17:07:43.62+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9a2c-77e9-9fed-ba0f0ead5a14', '01a0e8fc-9969-7c41-9c42-0ae2e0edd08e', true, '2026-09-28 17:07:43.798+00', '2026-09-28 17:07:43.798+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9b41-7260-9d3b-da8345847efe', '01a0e8fc-9a91-74ec-a9f2-a71539356fa9', true, '2026-09-28 17:07:44.075+00', '2026-09-28 17:07:44.075+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9b6f-70ea-aaba-b6905376ddce', '01a0e8fc-9ac7-7d53-9ba9-7057c3a36d1f', true, '2026-09-28 17:07:44.122+00', '2026-09-28 17:07:44.122+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9cef-790f-a1dc-415429b7bcf2', '01a0e8fc-9c52-7280-8d9a-c1d4c7102650', true, '2026-09-28 17:07:44.506+00', '2026-09-28 17:07:44.506+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9d78-7894-a599-a2fca53e46af', '01a0e8fc-9cf9-734e-91ca-1a755c138f6b', true, '2026-09-28 17:07:44.637+00', '2026-09-28 17:07:44.637+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9da0-71c5-b8eb-e142f827e683', '01a0e8fc-9d24-7773-8121-747eed2fa7e1', true, '2026-09-28 17:07:44.678+00', '2026-09-28 17:07:44.678+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9eb4-7416-a8ee-53ea00aedb25', '01a0e8fc-9e3e-719c-854f-37712d7723bb', true, '2026-09-28 17:07:44.956+00', '2026-09-28 17:07:44.956+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9f2f-72cd-a476-c6bf7c6cdcfa', '01a0e8fc-9ec3-772e-a7bc-53f66b1b1109', true, '2026-09-28 17:07:45.076+00', '2026-09-28 17:07:45.076+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9f4e-7abf-a0c7-c143c37ab131', '01a0e8fc-9ee3-7fa4-b833-aaa1cf1c0763', true, '2026-09-28 17:07:45.108+00', '2026-09-28 17:07:45.108+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-9fd5-7618-9c10-5d79187b882b', '01a0e8fc-9f74-7f06-b4f9-76cb589068fd', true, '2026-09-28 17:07:45.24+00', '2026-09-28 17:07:45.24+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-a09c-7683-8f34-6a1a18dac493', '01a0e8fc-a049-7065-b819-c3b8efa62486', true, '2026-09-28 17:07:45.439+00', '2026-09-28 17:07:45.439+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-a14f-7ba8-a052-9ecb3cabb7a1', '01a0e8fc-a0fb-72a0-aab8-d493f63b34dd', true, '2026-09-28 17:07:45.618+00', '2026-09-28 17:07:45.618+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-a28c-785c-b384-1fdf5c86b1f0', '01a0e8fc-a241-7712-a727-49eeafcea1bc', true, '2026-09-28 17:07:45.935+00', '2026-09-28 17:07:45.935+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-a3be-7354-8a1c-80afb0ecd723', '01a0e8fc-a372-705b-8d71-b06b88d478c6', true, '2026-09-28 17:07:46.24+00', '2026-09-28 17:07:46.24+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-a45e-7b23-af13-fc67af183748', '01a0e8fc-a414-7ed5-b9b2-539581af81b5', true, '2026-09-28 17:07:46.401+00', '2026-09-28 17:07:46.401+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-a4f6-7629-9f9f-f4c74cc34b94', '01a0e8fc-a4ad-76ee-a537-83a33d82176b', true, '2026-09-28 17:07:46.554+00', '2026-09-28 17:07:46.554+00');
INSERT INTO public.band_members VALUES ('01a0e8fc-a504-7a51-9a5e-631272d700d8', '01a0e8fc-a4ad-76ee-a537-83a33d82176b', true, '2026-09-28 17:07:46.567+00', '2026-09-28 17:07:46.567+00');
INSERT INTO public.band_members VALUES ('01a0e904-6d97-7a0d-a83b-9fc57682329b', '01a0e904-6d40-7142-86bc-ddf4288b6ed5', true, '2026-09-28 17:16:16.667+00', '2026-09-28 17:16:16.667+00');
INSERT INTO public.band_members VALUES ('01a0e904-6e74-7db4-9fdc-8d6b741f111a', '01a0e904-6e31-7006-a8b0-621fba884e9c', true, '2026-09-28 17:16:16.887+00', '2026-09-28 17:16:16.887+00');
INSERT INTO public.band_members VALUES ('01a0e904-6f24-79b9-ac36-a535f94c070d', '01a0e904-6ee2-7992-9e4e-2347b386e0e0', true, '2026-09-28 17:16:17.062+00', '2026-09-28 17:16:17.062+00');
INSERT INTO public.band_members VALUES ('01a0e904-6fb7-79a3-bd79-73d21c86554a', '01a0e904-6f75-7c28-993f-19b3c9fffc4e', true, '2026-09-28 17:16:17.21+00', '2026-09-28 17:16:17.21+00');
INSERT INTO public.band_members VALUES ('01a0e904-7047-70e7-b82b-972a53dad25c', '01a0e904-7007-7f91-8e98-1e9ca970d9b9', true, '2026-09-28 17:16:17.353+00', '2026-09-28 17:16:17.353+00');
INSERT INTO public.band_members VALUES ('01a0e904-714b-7793-b7cb-fab53e35e100', '01a0e904-710a-7946-975b-92b0bef70dc5', true, '2026-09-28 17:16:17.613+00', '2026-09-28 17:16:17.613+00');
INSERT INTO public.band_members VALUES ('01a0e904-724d-7c85-9c0e-88e8af6ff273', '01a0e904-720d-78b0-a068-cc0fcc5b723c', true, '2026-09-28 17:16:17.872+00', '2026-09-28 17:16:17.872+00');
INSERT INTO public.band_members VALUES ('01a0e904-72d6-7cc9-8633-03e7d6431d7c', '01a0e904-7296-73fc-a476-9f252d5ad42e', true, '2026-09-28 17:16:18.008+00', '2026-09-28 17:16:18.008+00');
INSERT INTO public.band_members VALUES ('01a0e904-735d-70af-9973-6fefd72b0479', '01a0e904-731d-72a3-9839-2d49a3f0e8e2', true, '2026-09-28 17:16:18.143+00', '2026-09-28 17:16:18.143+00');
INSERT INTO public.band_members VALUES ('01a0e904-7367-7b98-a630-1da9e3946fba', '01a0e904-731d-72a3-9839-2d49a3f0e8e2', true, '2026-09-28 17:16:18.154+00', '2026-09-28 17:16:18.154+00');
INSERT INTO public.band_members VALUES ('01a0e906-0b3c-7005-8813-fc1d9ba39a69', '01a0e906-0ae2-72a8-8acb-89755a38e14b', true, '2026-09-28 17:18:02.56+00', '2026-09-28 17:18:02.56+00');
INSERT INTO public.band_members VALUES ('01a0e906-0c1b-76b4-abba-d344efed6376', '01a0e906-0bd6-7a81-a98c-d3ad037b0a08', true, '2026-09-28 17:18:02.782+00', '2026-09-28 17:18:02.782+00');
INSERT INTO public.band_members VALUES ('01a0e906-0ccb-75f4-8f89-8040acd92839', '01a0e906-0c89-7e63-9908-f02522918a4a', true, '2026-09-28 17:18:02.957+00', '2026-09-28 17:18:02.957+00');
INSERT INTO public.band_members VALUES ('01a0e906-0d57-7d10-a6aa-77b109dec364', '01a0e906-0d19-7a36-9e0e-bd6e5275422a', true, '2026-09-28 17:18:03.098+00', '2026-09-28 17:18:03.098+00');
INSERT INTO public.band_members VALUES ('01a0e906-0ddf-7b15-bb23-0183deeb3aa1', '01a0e906-0da2-7a98-aa05-beaec7930368', true, '2026-09-28 17:18:03.234+00', '2026-09-28 17:18:03.234+00');
INSERT INTO public.band_members VALUES ('01a0e906-0edb-7517-b9c9-35f50b4a0515', '01a0e906-0e9e-7b62-88be-8be85846f0c3', true, '2026-09-28 17:18:03.485+00', '2026-09-28 17:18:03.485+00');
INSERT INTO public.band_members VALUES ('01a0e906-0fdc-74cf-807f-3b7f64b5c1c8', '01a0e906-0f9c-743a-ae27-3e165e58efd9', true, '2026-09-28 17:18:03.742+00', '2026-09-28 17:18:03.742+00');
INSERT INTO public.band_members VALUES ('01a0e906-1064-773f-badc-591e8ab6d8c1', '01a0e906-1023-7452-9e75-320a15f18e9c', true, '2026-09-28 17:18:03.878+00', '2026-09-28 17:18:03.878+00');
INSERT INTO public.band_members VALUES ('01a0e906-10e4-7d85-baf5-80d77ac5e3b5', '01a0e906-10a6-7e3f-a5c2-375a3c2265ef', true, '2026-09-28 17:18:04.007+00', '2026-09-28 17:18:04.007+00');
INSERT INTO public.band_members VALUES ('01a0e906-10ed-773a-a05b-1eed314fd784', '01a0e906-10a6-7e3f-a5c2-375a3c2265ef', true, '2026-09-28 17:18:04.016+00', '2026-09-28 17:18:04.016+00');


--
-- TOC entry 3540 (class 0 OID 16605)
-- Dependencies: 222
-- Data for Name: band_setlist_songs; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.band_setlist_songs VALUES ('01a088fe-8dcd-79e9-b5b8-686a943d36de', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088ea-d60f-74bc-be07-a4f458bb1749', 1, '2026-09-10 01:46:18.957+00', '2026-09-10 01:46:18.957+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-9277-774c-bb7d-20e3c478aa40', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088ee-d793-7cc1-97aa-7521d712c6ba', 2, '2026-09-10 01:46:20.151+00', '2026-09-10 01:46:20.151+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-95b7-726e-ae3a-fca11a99600c', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f0-0755-79a2-976b-4cd47d9c50db', 3, '2026-09-10 01:46:20.983+00', '2026-09-10 01:46:20.983+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-9a36-7b53-b4f2-4e25b04b820f', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f1-41c9-7a59-bfee-512b45424851', 4, '2026-09-10 01:46:22.134+00', '2026-09-10 01:46:22.134+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-9d35-74ac-adf9-91afe0394017', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f2-d747-79fe-860b-47a505eb7cb1', 5, '2026-09-10 01:46:22.901+00', '2026-09-10 01:46:22.901+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-a06a-755d-9f5a-0f6ecdbb540d', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f3-ef13-7af0-989a-760dbf620abc', 6, '2026-09-10 01:46:23.722+00', '2026-09-10 01:46:23.722+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-a6e9-7abf-8ec1-70d03dfedc04', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f5-8ce5-78ac-afc1-75ce3759c005', 7, '2026-09-10 01:46:25.385+00', '2026-09-10 01:46:25.385+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-aa2b-7947-8d3d-164ce431ac6c', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f7-3611-7e7b-a92d-8b633c408f05', 8, '2026-09-10 01:46:26.219+00', '2026-09-10 01:46:26.219+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-bd15-77cb-95d9-b6ea5ad39445', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f8-0dcb-7b29-a772-5884b834abd5', 9, '2026-09-10 01:46:31.061+00', '2026-09-10 01:46:31.061+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-c0fd-79e4-8af0-05052551bcea', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f8-adb5-7fec-9925-ca2df41ee968', 10, '2026-09-10 01:46:32.061+00', '2026-09-10 01:46:32.061+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-c73f-7401-9735-9fe08f605714', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088f9-8660-7f27-8fb4-904a44b55dcb', 11, '2026-09-10 01:46:33.663+00', '2026-09-10 01:46:33.663+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-caa7-72e3-9587-f8d12ad1a62a', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088fa-b586-7785-a236-99519f06ed01', 12, '2026-09-10 01:46:34.535+00', '2026-09-10 01:46:34.535+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-cdf8-74de-82ff-dffec0e486c4', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088fc-112f-7bcd-aceb-f3d14a48a0f1', 13, '2026-09-10 01:46:35.384+00', '2026-09-10 01:46:35.384+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-d3e7-747a-8224-de54e4036f63', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088fc-9cb2-7331-9cf6-63b03205784e', 14, '2026-09-10 01:46:36.903+00', '2026-09-10 01:46:36.903+00');
INSERT INTO public.band_setlist_songs VALUES ('01a088fe-d726-7607-b100-1a77c77034c2', '01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088fd-55e1-7bcc-908d-e57440cb34e3', 15, '2026-09-10 01:46:37.734+00', '2026-09-10 01:46:37.734+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-77de-7677-9a67-7c2a19ee37d6', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8d7-7fdb-71b5-b006-7c6f1755dee7', 1, '2026-09-28 16:50:06.43+00', '2026-09-28 16:50:06.43+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-cd87-7e08-ab54-0e36895f6b78', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8da-8091-7c95-b4bb-b7d13f23483e', 2, '2026-09-28 16:50:28.359+00', '2026-09-28 16:50:28.359+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-7e4e-771e-bdf1-fc7eae02cf97', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8db-f280-77f6-ba3f-c1af9ab6b5f5', 3, '2026-09-28 16:50:08.078+00', '2026-09-28 16:50:08.078+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-810e-745c-bac6-2d8079b9b58f', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8de-47dd-7070-8f79-95be9e4a443f', 4, '2026-09-28 16:50:08.782+00', '2026-09-28 16:50:08.782+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-849e-7c51-b139-21b2c01a2c7d', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8e1-19e9-7364-9e0f-2362668225fe', 5, '2026-09-28 16:50:09.694+00', '2026-09-28 16:50:09.694+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-8762-7bfc-85f4-b6b022b02187', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8e2-792c-783c-a9c7-a5dcfbb9a556', 6, '2026-09-28 16:50:10.402+00', '2026-09-28 16:50:10.402+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-89d6-7b71-ab6f-8e19baf5457d', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8e4-437c-7618-b2a5-437f16eaf893', 7, '2026-09-28 16:50:11.03+00', '2026-09-28 16:50:11.03+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-906b-784e-95e5-8593bfa509c2', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8e6-9c61-7a64-a6e2-72da048ad3a9', 8, '2026-09-28 16:50:12.715+00', '2026-09-28 16:50:12.715+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-95f0-7b42-8694-e00ff4765939', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8e8-631a-713b-9bfd-426cf42698a0', 9, '2026-09-28 16:50:14.128+00', '2026-09-28 16:50:14.128+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-9840-75ef-9157-0e097fb914f9', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8e9-9f3a-7f82-8ca2-059166256f6a', 10, '2026-09-28 16:50:14.72+00', '2026-09-28 16:50:14.72+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-9c93-72f4-b49e-e4f6dd618c21', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8eb-00d1-79b1-89ae-86d3640bfab7', 11, '2026-09-28 16:50:15.827+00', '2026-09-28 16:50:15.827+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8ec-9f47-7b4a-b571-6e5330ce8b70', '01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8ec-2844-73e3-b4fc-2b3996fd4a98', 12, '2026-09-28 16:50:16.519+00', '2026-09-28 16:50:16.519+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fa-8763-7d76-8d82-306e1ab9b3d0', '01a0e8fa-872f-7f39-80c7-f298549fb457', '01a0e8fa-8752-7fd6-8e06-2da834dec666', 2, '2026-09-28 17:05:27.907+00', '2026-09-28 17:05:27.907+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fa-8770-70fc-86de-e1cd0ebd1559', '01a0e8fa-872f-7f39-80c7-f298549fb457', '01a0e8fa-8743-7f34-9767-bc06f61572d5', 1, '2026-09-28 17:05:27.92+00', '2026-09-28 17:05:27.92+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fa-8829-7b10-8f79-74297e4502f7', '01a0e8fa-8806-7b30-801d-0432ae5eda57', '01a0e8fa-881d-701a-b85b-f3730cf274fd', 1, '2026-09-28 17:05:28.105+00', '2026-09-28 17:05:28.105+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9469-7259-9ecf-bf3f73187634', '01a0e8fc-93dd-7c17-a1bc-b6900a43c1f1', '01a0e8fc-940b-7785-a28c-b5909cf43f6a', 1, '2026-09-28 17:07:42.313+00', '2026-09-28 17:07:42.313+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9a2f-720f-8565-08e267b3a354', '01a0e8fc-9a00-7345-84b0-067e19d66fcb', '01a0e8fc-940b-7785-a28c-b5909cf43f6a', 1, '2026-09-28 17:07:43.791+00', '2026-09-28 17:07:43.791+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9a68-7acb-9537-acb381e05a8f', '01a0e8fc-9a00-7345-84b0-067e19d66fcb', '01a0e8fc-940b-7785-a28c-b5909cf43f6a', 2, '2026-09-28 17:07:43.848+00', '2026-09-28 17:07:43.848+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9afd-7ae9-94ff-c023d24a7b02', '01a0e8fc-9a92-766b-9fe1-37574576cf7e', '01a0e8fc-940b-7785-a28c-b5909cf43f6a', 1, '2026-09-28 17:07:43.997+00', '2026-09-28 17:07:43.997+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9b23-7454-a474-4577a0e500fe', '01a0e8fc-9a92-766b-9fe1-37574576cf7e', '01a0e8fc-9ab6-7d78-bf09-8444547a845d', 2, '2026-09-28 17:07:44.035+00', '2026-09-28 17:07:44.035+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9d89-70da-9d8a-f6a73a266744', '01a0e8fc-9d22-7656-88af-e66d9cf94e42', '01a0e8fc-9d61-7d44-b243-ca9ab46ddcd6', 2, '2026-09-28 17:07:44.649+00', '2026-09-28 17:07:44.649+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9da8-768f-91dd-68a9ed12047f', '01a0e8fc-9d22-7656-88af-e66d9cf94e42', '01a0e8fc-9d41-7ae6-a2fd-1d07ae695072', 1, '2026-09-28 17:07:44.681+00', '2026-09-28 17:07:44.681+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e8fc-9f01-7b70-8c19-2abe208b0539', '01a0e8fc-9ed1-7319-b601-370c33d33351', '01a0e8fc-9ee6-7541-9113-5f147684b615', 1, '2026-09-28 17:07:45.025+00', '2026-09-28 17:07:45.025+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e904-6dd4-73f0-bf24-444b64660763', '01a0e904-6daa-7a8a-9363-90e9e692fbeb', '01a0e904-6dc4-79ba-bc45-643adde7addb', 2, '2026-09-28 17:16:16.724+00', '2026-09-28 17:16:16.724+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e904-6de2-777d-8bd8-c7d8b4996629', '01a0e904-6daa-7a8a-9363-90e9e692fbeb', '01a0e904-6db6-7a25-9286-2f006c4cb208', 1, '2026-09-28 17:16:16.738+00', '2026-09-28 17:16:16.738+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e904-6e9d-74cf-aeb2-6edb68e60ad0', '01a0e904-6e82-7e26-a41b-35cca1657f3d', '01a0e904-6e8c-778f-8241-c61c2a1d4b0d', 1, '2026-09-28 17:16:16.925+00', '2026-09-28 17:16:16.925+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e906-0b78-7ef2-98b5-12be731d9b2b', '01a0e906-0b4f-7acc-a24a-7c96b03182cd', '01a0e906-0b68-73cf-bb5a-cc32b3bfa44b', 2, '2026-09-28 17:18:02.616+00', '2026-09-28 17:18:02.616+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e906-0b85-7957-9930-5003f0d41fa3', '01a0e906-0b4f-7acc-a24a-7c96b03182cd', '01a0e906-0b5c-713d-90db-b586854faefa', 1, '2026-09-28 17:18:02.629+00', '2026-09-28 17:18:02.629+00');
INSERT INTO public.band_setlist_songs VALUES ('01a0e906-0c44-70ee-97e0-d0a66c1724b3', '01a0e906-0c29-77d4-8b35-8e808e92c6e8', '01a0e906-0c38-7b47-9d7d-2094f03e1d02', 1, '2026-09-28 17:18:02.821+00', '2026-09-28 17:18:02.821+00');


--
-- TOC entry 3539 (class 0 OID 16590)
-- Dependencies: 221
-- Data for Name: band_setlists; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.band_setlists VALUES ('01a088fe-58c8-7577-90f5-a5cdc99f82d5', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Show dia 07 Novembro', '2026-09-10 01:46:05.384+00', '2026-09-10 01:46:05.384+00');
INSERT INTO public.band_setlists VALUES ('01a0e8d2-0986-7c53-b121-a780908a6144', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Knights Pub', '2026-09-28 16:21:14.246+00', '2026-09-28 16:21:14.246+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-872f-7f39-80c7-f298549fb457', '01a0e8fa-8714-70c4-844a-11667f4fc6b5', 'Show de Sábado 1790615127841.4szc47haorm', '2026-09-28 17:05:27.855+00', '2026-09-28 17:05:27.855+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-8806-7b30-801d-0432ae5eda57', '01a0e8fa-87f9-7b46-bba7-bf85a64f0ee3', 'Show de Sábado 1790615128065.kz9vzslxog', '2026-09-28 17:05:28.07+00', '2026-09-28 17:05:28.07+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-88b4-7b8e-9ad8-a52620c05fc6', '01a0e8fa-88aa-7914-9ac7-7247fcefb608', 'Show de Sábado 1790615128240.cut0o1r0o7f', '2026-09-28 17:05:28.244+00', '2026-09-28 17:05:28.244+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-893f-7375-9747-743e73763aa6', '01a0e8fa-8934-7056-a796-69e4b4aa10e5', 'Show de Sábado 1790615128378.iyw0n05op3n', '2026-09-28 17:05:28.383+00', '2026-09-28 17:05:28.383+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-89c7-74d0-b6a1-9515490af759', '01a0e8fa-89bb-7046-b6eb-ab3578bc372b', 'Show de Sábado 1790615128514.of9as2xlf7', '2026-09-28 17:05:28.519+00', '2026-09-28 17:05:28.519+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-8ac1-71bc-bb1c-d2c11dc967ab', '01a0e8fa-8ab3-7bfc-95ba-153002b9baa1', 'Show de Sábado 1790615128765.yha84uwzy79', '2026-09-28 17:05:28.769+00', '2026-09-28 17:05:28.769+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-ddc6-705b-ae04-2896dccd5b36', '01a0e8fa-ddba-72d0-b933-94c9fb8f9c19', 'Show de Sábado 1790615150017.7s7i44ff0nb', '2026-09-28 17:05:50.022+00', '2026-09-28 17:05:50.022+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fa-8cb5-76d0-87a4-180b64842913', '01a0e8fa-8caa-7989-8b7c-6679c5ad7075', 'Show de Sábado 1790615129265.hb8q1c789lo', '2026-09-28 17:05:29.269+00', '2026-09-28 17:05:29.269+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-93d3-7a8b-bcbc-fa2c7cfa0d36', '01a0e8fc-937b-720a-af93-57a2ee57060e', 'Show de Sábado', '2026-09-28 17:07:42.163+00', '2026-09-28 17:07:42.163+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-93dd-7c17-a1bc-b6900a43c1f1', '01a0e8fc-9393-7ff8-9997-7f68a6499a9b', 'Show de Sábado 1790615262144.uru0rx1214l', '2026-09-28 17:07:42.173+00', '2026-09-28 17:07:42.173+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-93ed-7a10-b206-e3d867fe2006', '01a0e8fc-9383-7a9a-815d-4c4098d104bb', 'Show de Sábado', '2026-09-28 17:07:42.189+00', '2026-09-28 17:07:42.189+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9406-7a35-b84c-5a25cffbf60e', '01a0e8fc-937b-720a-af93-57a2ee57060e', 'Show Acústico', '2026-09-28 17:07:42.215+00', '2026-09-28 17:07:42.215+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9815-7f48-a6ad-8a835c199279', '01a0e8fc-97d9-7f9b-9ec2-ff51be5dbf84', 'Another Band Setlist', '2026-09-28 17:07:43.253+00', '2026-09-28 17:07:43.253+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9919-788c-9750-12b3c49b2d75', '01a0e8fc-98e6-7850-bc83-97072ffb945b', 'Show de Sábado 1790615263493.983mo00t13w', '2026-09-28 17:07:43.514+00', '2026-09-28 17:07:43.514+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9a00-7345-84b0-067e19d66fcb', '01a0e8fc-9393-7ff8-9997-7f68a6499a9b', 'Show de Sábado 1790615263725.cbjrf3zr51g', '2026-09-28 17:07:43.744+00', '2026-09-28 17:07:43.744+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9a92-766b-9fe1-37574576cf7e', '01a0e8fc-9393-7ff8-9997-7f68a6499a9b', 'Show de Sábado 1790615263867.att1q4jftmq', '2026-09-28 17:07:43.89+00', '2026-09-28 17:07:43.89+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9d22-7656-88af-e66d9cf94e42', '01a0e8fc-9cef-790f-a1dc-415429b7bcf2', 'Show de Sábado 1790615264523.5ifcyee9s0m', '2026-09-28 17:07:44.546+00', '2026-09-28 17:07:44.546+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9ed1-7319-b601-370c33d33351', '01a0e8fc-9eb4-7416-a8ee-53ea00aedb25', 'Show de Sábado 1790615264966.0q46gmbclfsg', '2026-09-28 17:07:44.977+00', '2026-09-28 17:07:44.977+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-9fe6-71b1-9a87-340195a4964f', '01a0e8fc-9fd5-7618-9c10-5d79187b882b', 'Show de Sábado 1790615265246.t424t173kl', '2026-09-28 17:07:45.254+00', '2026-09-28 17:07:45.254+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-a0aa-7ddd-b76b-0273ccd101eb', '01a0e8fc-a09c-7683-8f34-6a1a18dac493', 'Show de Sábado 1790615265444.1of03kshgmdh', '2026-09-28 17:07:45.45+00', '2026-09-28 17:07:45.45+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-a15c-7075-8c11-e7f40526e746', '01a0e8fc-a14f-7ba8-a052-9ecb3cabb7a1', 'Show de Sábado 1790615265623.67064t2wta6', '2026-09-28 17:07:45.628+00', '2026-09-28 17:07:45.628+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-a29a-72e2-a512-5efbe496a973', '01a0e8fc-a28c-785c-b384-1fdf5c86b1f0', 'Show de Sábado 1790615265939.7nlllhi0a68', '2026-09-28 17:07:45.946+00', '2026-09-28 17:07:45.946+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-a3cb-73e4-b42c-84e941d861be', '01a0e8fc-a3be-7354-8a1c-80afb0ecd723', 'Show de Sábado 1790615266246.0k6ufxj4ijlr', '2026-09-28 17:07:46.251+00', '2026-09-28 17:07:46.251+00');
INSERT INTO public.band_setlists VALUES ('01a0e8fc-a513-7d1c-9111-159fdb9f7759', '01a0e8fc-a504-7a51-9a5e-631272d700d8', 'Show de Sábado 1790615266573.4erjiueq3ux', '2026-09-28 17:07:46.579+00', '2026-09-28 17:07:46.579+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-6daa-7a8a-9363-90e9e692fbeb', '01a0e904-6d97-7a0d-a83b-9fc57682329b', 'Show de Sábado 1790615776674.qj7vi6vhq4', '2026-09-28 17:16:16.682+00', '2026-09-28 17:16:16.682+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-6e82-7e26-a41b-35cca1657f3d', '01a0e904-6e74-7db4-9fdc-8d6b741f111a', 'Show de Sábado 1790615776892.gu9fq80t0k', '2026-09-28 17:16:16.898+00', '2026-09-28 17:16:16.898+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-6f31-78aa-a0e1-50b55573c6aa', '01a0e904-6f24-79b9-ac36-a535f94c070d', 'Show de Sábado 1790615777068.4d8ddmbz6eg', '2026-09-28 17:16:17.073+00', '2026-09-28 17:16:17.073+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-6fc5-761a-8c9a-f896805c77f2', '01a0e904-6fb7-79a3-bd79-73d21c86554a', 'Show de Sábado 1790615777216.7bbk43w2g65', '2026-09-28 17:16:17.221+00', '2026-09-28 17:16:17.221+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-7052-7a5d-9273-6f1529e7a3cc', '01a0e904-7047-70e7-b82b-972a53dad25c', 'Show de Sábado 1790615777358.lso5qfzcwef', '2026-09-28 17:16:17.362+00', '2026-09-28 17:16:17.362+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-7158-700c-9a5d-effed7bda766', '01a0e904-714b-7793-b7cb-fab53e35e100', 'Show de Sábado 1790615777619.gxfcuijb1l8', '2026-09-28 17:16:17.624+00', '2026-09-28 17:16:17.624+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-7258-7a91-8957-0b620255ce4f', '01a0e904-724d-7c85-9c0e-88e8af6ff273', 'Show de Sábado 1790615777876.jvczbrz4e', '2026-09-28 17:16:17.88+00', '2026-09-28 17:16:17.88+00');
INSERT INTO public.band_setlists VALUES ('01a0e904-7373-7454-84d3-dd2ceef0279c', '01a0e904-7367-7b98-a630-1da9e3946fba', 'Show de Sábado 1790615778158.fldpjvje3ce', '2026-09-28 17:16:18.163+00', '2026-09-28 17:16:18.163+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-0b4f-7acc-a24a-7c96b03182cd', '01a0e906-0b3c-7005-8813-fc1d9ba39a69', 'Show de Sábado 1790615882567.5e7dlreq6im', '2026-09-28 17:18:02.575+00', '2026-09-28 17:18:02.575+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-0c29-77d4-8b35-8e808e92c6e8', '01a0e906-0c1b-76b4-abba-d344efed6376', 'Show de Sábado 1790615882787.yvsshpmde6o', '2026-09-28 17:18:02.793+00', '2026-09-28 17:18:02.793+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-0cd7-7ef4-b123-daceb056315b', '01a0e906-0ccb-75f4-8f89-8040acd92839', 'Show de Sábado 1790615882961.gvpfkfkri5i', '2026-09-28 17:18:02.967+00', '2026-09-28 17:18:02.967+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-0d62-7800-9614-aac53a88afa0', '01a0e906-0d57-7d10-a6aa-77b109dec364', 'Show de Sábado 1790615883102.yc2fr4tgonn', '2026-09-28 17:18:03.106+00', '2026-09-28 17:18:03.106+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-0deb-7b14-b55e-8f8af1a53b33', '01a0e906-0ddf-7b15-bb23-0183deeb3aa1', 'Show de Sábado 1790615883239.ivbk2fnfkog', '2026-09-28 17:18:03.243+00', '2026-09-28 17:18:03.243+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-0ee7-7c1c-ae99-4065f677efa0', '01a0e906-0edb-7517-b9c9-35f50b4a0515', 'Show de Sábado 1790615883489.j30k1n5bgth', '2026-09-28 17:18:03.495+00', '2026-09-28 17:18:03.495+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-0fe8-7e7d-a3fb-af195f7991e2', '01a0e906-0fdc-74cf-807f-3b7f64b5c1c8', 'Show de Sábado 1790615883748.zcwyn7xf82j', '2026-09-28 17:18:03.752+00', '2026-09-28 17:18:03.752+00');
INSERT INTO public.band_setlists VALUES ('01a0e906-10f8-76cd-9559-731933dea15b', '01a0e906-10ed-773a-a05b-1eed314fd784', 'Show de Sábado 1790615884020.jrd2oydmtgb', '2026-09-28 17:18:04.024+00', '2026-09-28 17:18:04.024+00');


--
-- TOC entry 3538 (class 0 OID 16575)
-- Dependencies: 220
-- Data for Name: band_songs; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.band_songs VALUES ('01a088f1-41c9-7a59-bfee-512b45424851', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'I', 'Eb-Ab-Db-Gb-Bb-Eb', 'Ebm', 94, 313, NULL, NULL, '2026-09-10 01:31:47.529+00', '2026-09-10 01:31:47.529+00');
INSERT INTO public.band_songs VALUES ('01a088f2-d747-79fe-860b-47a505eb7cb1', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Heaven and Hell', 'Eb-Ab-Db-Gb-Bb-Eb', 'Ebm', 89, 360, NULL, NULL, '2026-09-10 01:33:31.335+00', '2026-09-10 01:33:31.335+00');
INSERT INTO public.band_songs VALUES ('01a088f3-ef13-7af0-989a-760dbf620abc', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Children of the Sea', 'Eb-Ab-Db-Gb-Bb-Eb', 'Abm', 71, 333, NULL, NULL, '2026-09-10 01:34:42.963+00', '2026-09-10 01:34:42.963+00');
INSERT INTO public.band_songs VALUES ('01a088f5-8ce5-78ac-afc1-75ce3759c005', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Stargazer', 'E-A-D-G-B-E', 'Em', 88, 506, NULL, NULL, '2026-09-10 01:36:28.901+00', '2026-09-10 01:36:28.901+00');
INSERT INTO public.band_songs VALUES ('01a088f7-3611-7e7b-a92d-8b633c408f05', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Die Young', 'Eb-Ab-Db-Gb-Bb-Eb', 'Ebm', 200, 283, NULL, NULL, '2026-09-10 01:38:17.745+00', '2026-09-10 01:38:17.745+00');
INSERT INTO public.band_songs VALUES ('01a088f8-0dcb-7b29-a772-5884b834abd5', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Don''t Talk to Strangers', 'E-A-D-G-B-E', 'Dm', 132, 293, NULL, NULL, '2026-09-10 01:39:12.971+00', '2026-09-10 01:39:12.971+00');
INSERT INTO public.band_songs VALUES ('01a088f8-adb5-7fec-9925-ca2df41ee968', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Long Live Rock N'' Roll', 'E-A-D-G-B-E', 'Gm', 143, 261, NULL, NULL, '2026-09-10 01:39:53.909+00', '2026-09-10 01:39:53.909+00');
INSERT INTO public.band_songs VALUES ('01a088f9-8660-7f27-8fb4-904a44b55dcb', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'We Rock', 'E-A-D-G-B-E', 'Am', 154, 273, NULL, NULL, '2026-09-10 01:40:49.376+00', '2026-09-10 01:40:49.376+00');
INSERT INTO public.band_songs VALUES ('01a088fa-b586-7785-a236-99519f06ed01', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Kill the King', 'E-A-D-G-B-E', 'Gm', 239, 267, NULL, NULL, '2026-09-10 01:42:06.982+00', '2026-09-10 01:42:06.982+00');
INSERT INTO public.band_songs VALUES ('01a088fc-112f-7bcd-aceb-f3d14a48a0f1', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'The Mob Rules', 'Eb-Ab-Db-Gb-Bb-Eb', 'Abm', 144, 192, NULL, NULL, '2026-09-10 01:43:35.983+00', '2026-09-10 01:43:35.983+00');
INSERT INTO public.band_songs VALUES ('01a088fc-9cb2-7331-9cf6-63b03205784e', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Killing the Dragon', 'E-A-D-G-B-E', 'Gm', 141, 265, NULL, NULL, '2026-09-10 01:44:11.698+00', '2026-09-10 01:44:11.698+00');
INSERT INTO public.band_songs VALUES ('01a088fd-55e1-7bcc-908d-e57440cb34e3', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Neon Knights', 'Eb-Ab-Db-Gb-Bb-Eb', 'Eb', 192, 231, NULL, NULL, '2026-09-10 01:44:59.105+00', '2026-09-10 01:44:59.105+00');
INSERT INTO public.band_songs VALUES ('01a088ea-d60f-74bc-be07-a4f458bb1749', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'The Last in Line', 'E-A-D-G-B-E', 'Am', 86, 340, NULL, NULL, '2026-09-10 01:24:46.735+00', '2026-09-10 01:24:46.735+00');
INSERT INTO public.band_songs VALUES ('01a088ee-d793-7cc1-97aa-7521d712c6ba', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Holy Diver', 'E-A-D-G-B-E', 'Cm', 93, 366, NULL, NULL, '2026-09-10 01:29:09.267+00', '2026-09-10 01:29:09.267+00');
INSERT INTO public.band_songs VALUES ('01a088f0-0755-79a2-976b-4cd47d9c50db', '01a088e3-8eff-75f0-946e-2b9266c722a0', 'Rainbow In the Dark', 'E-A-D-G-B-E', 'Am', 118, 253, NULL, NULL, '2026-09-10 01:30:27.029+00', '2026-09-10 01:30:27.029+00');
INSERT INTO public.band_songs VALUES ('01a0e8d7-7fdb-71b5-b006-7c6f1755dee7', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Children of the Grave', 'C#', 'C#m', 146, 318, NULL, NULL, '2026-09-28 16:27:12.219+00', '2026-09-28 16:27:12.219+00');
INSERT INTO public.band_songs VALUES ('01a0e8da-8091-7c95-b4bb-b7d13f23483e', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Cornucopia', 'C#', 'C#m', 142, 234, NULL, NULL, '2026-09-28 16:30:29.009+00', '2026-09-28 16:30:29.009+00');
INSERT INTO public.band_songs VALUES ('01a0e8db-f280-77f6-ba3f-c1af9ab6b5f5', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Killing Yourself to Live', 'C#', 'C#m', 125, 341, NULL, NULL, '2026-09-28 16:32:03.712+00', '2026-09-28 16:32:03.712+00');
INSERT INTO public.band_songs VALUES ('01a0e8de-47dd-7070-8f79-95be9e4a443f', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Sabbath Bloody Sabbath', 'C#', 'C#m', 133, 345, NULL, NULL, '2026-09-28 16:34:36.637+00', '2026-09-28 16:34:36.637+00');
INSERT INTO public.band_songs VALUES ('01a0e8e1-19e9-7364-9e0f-2362668225fe', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Under the Sun', 'C#', 'C#m', 130, 352, NULL, NULL, '2026-09-28 16:37:41.481+00', '2026-09-28 16:37:41.481+00');
INSERT INTO public.band_songs VALUES ('01a0e8e2-792c-783c-a9c7-a5dcfbb9a556', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Snowblind', 'C#', 'C#m', 115, 333, NULL, NULL, '2026-09-28 16:39:11.404+00', '2026-09-28 16:39:11.404+00');
INSERT INTO public.band_songs VALUES ('01a0e8e4-437c-7618-b2a5-437f16eaf893', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Supernaut', 'C#', 'C#m', 120, 240, NULL, NULL, '2026-09-28 16:41:08.732+00', '2026-09-28 16:41:08.732+00');
INSERT INTO public.band_songs VALUES ('01a0e8e6-9c61-7a64-a6e2-72da048ad3a9', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Into the Void', 'C#', 'C#m', 77, 373, NULL, NULL, '2026-09-28 16:43:42.561+00', '2026-09-28 16:43:42.561+00');
INSERT INTO public.band_songs VALUES ('01a0e8e8-631a-713b-9bfd-426cf42698a0', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Hand of Doom', 'E', 'Em', 136, 427, NULL, NULL, '2026-09-28 16:45:38.97+00', '2026-09-28 16:45:38.97+00');
INSERT INTO public.band_songs VALUES ('01a0e8e9-9f3a-7f82-8ca2-059166256f6a', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Electric Funeral', 'E', 'Em', 124, 290, NULL, NULL, '2026-09-28 16:46:59.898+00', '2026-09-28 16:46:59.898+00');
INSERT INTO public.band_songs VALUES ('01a0e8eb-00d1-79b1-89ae-86d3640bfab7', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Fairies Wear Boots', 'E', 'Gm', 136, 375, NULL, NULL, '2026-09-28 16:48:30.417+00', '2026-09-28 16:48:30.417+00');
INSERT INTO public.band_songs VALUES ('01a0e8ec-2844-73e3-b4fc-2b3996fd4a98', '01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Black Sabbath', 'E', 'Gm', 66, 378, NULL, NULL, '2026-09-28 16:49:46.052+00', '2026-09-28 16:49:46.052+00');
INSERT INTO public.band_songs VALUES ('01a0e8fa-8743-7f34-9767-bc06f61572d5', '01a0e8fa-8714-70c4-844a-11667f4fc6b5', 'Come As You Are 1790615127866.wupeatceg8f', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:05:27.875+00', '2026-09-28 17:05:27.875+00');
INSERT INTO public.band_songs VALUES ('01a0e8fa-8752-7fd6-8e06-2da834dec666', '01a0e8fa-8714-70c4-844a-11667f4fc6b5', 'Come As You Are 1790615127884.yqgo31tp9fr', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:05:27.89+00', '2026-09-28 17:05:27.89+00');
INSERT INTO public.band_songs VALUES ('01a0e8fa-881d-701a-b85b-f3730cf274fd', '01a0e8fa-87f9-7b46-bba7-bf85a64f0ee3', 'Come As You Are 1790615128081.2z8t7kjwyq', 'Drop D', 'E Minor', 120, 219, 'Letra da música...', 'Tocar mais devagar no refrão', '2026-09-28 17:05:28.093+00', '2026-09-28 17:05:28.093+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-9400-7387-9edc-9ca8f98db391', '01a0e8fc-93a4-7de1-bfdb-bbb9624b2745', 'Smells Like Teen Spirit', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:42.208+00', '2026-09-28 17:07:42.208+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-940b-7785-a28c-b5909cf43f6a', '01a0e8fc-9393-7ff8-9997-7f68a6499a9b', 'Come As You Are 1790615262195.zv4fyadjpo8', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:42.219+00', '2026-09-28 17:07:42.219+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-9419-7a85-9076-d25e3a0bf961', '01a0e8fc-93c5-771e-8661-2f0e0f94a5d8', 'Come As You Are', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:42.233+00', '2026-09-28 17:07:42.233+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-943b-7a5b-a37b-0da506d526c1', '01a0e8fc-93a4-7de1-bfdb-bbb9624b2745', 'Come As You Are', 'Drop D', 'E Minor', 120, 219, 'Letra da música...', 'Tocar mais devagar no refrão', '2026-09-28 17:07:42.267+00', '2026-09-28 17:07:42.267+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-944c-7aa1-b19c-b1a6f38a8623', '01a0e8fc-93c5-771e-8661-2f0e0f94a5d8', 'Smells Like Teen Spirit', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:42.284+00', '2026-09-28 17:07:42.284+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-986c-754f-8615-139b52cf0af3', '01a0e8fc-982b-7d5b-ae63-b3b03ca0be0e', 'Another Band Song', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:43.341+00', '2026-09-28 17:07:43.341+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-99bb-7dcf-a81b-6a5b85e306fc', '01a0e8fc-997a-7b30-b330-97de10ab0fc0', 'Come As You Are 1790615263647.or8xtnir1vk', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:43.675+00', '2026-09-28 17:07:43.675+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-9ab6-7d78-bf09-8444547a845d', '01a0e8fc-9393-7ff8-9997-7f68a6499a9b', 'Come As You Are 1790615263907.n2wh5qju9yl', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:43.926+00', '2026-09-28 17:07:43.926+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-9d41-7ae6-a2fd-1d07ae695072', '01a0e8fc-9cef-790f-a1dc-415429b7bcf2', 'Come As You Are 1790615264562.141bi4xkjo4k', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:44.577+00', '2026-09-28 17:07:44.577+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-9d61-7d44-b243-ca9ab46ddcd6', '01a0e8fc-9cef-790f-a1dc-415429b7bcf2', 'Come As You Are 1790615264593.7x6n2xjg9t5', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:07:44.609+00', '2026-09-28 17:07:44.609+00');
INSERT INTO public.band_songs VALUES ('01a0e8fc-9ee6-7541-9113-5f147684b615', '01a0e8fc-9eb4-7416-a8ee-53ea00aedb25', 'Come As You Are 1790615264986.33q9hhj6636', 'Drop D', 'E Minor', 120, 219, 'Letra da música...', 'Tocar mais devagar no refrão', '2026-09-28 17:07:44.998+00', '2026-09-28 17:07:44.998+00');
INSERT INTO public.band_songs VALUES ('01a0e904-6db6-7a25-9286-2f006c4cb208', '01a0e904-6d97-7a0d-a83b-9fc57682329b', 'Come As You Are 1790615776688.ptung0cb4h8', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:16:16.694+00', '2026-09-28 17:16:16.694+00');
INSERT INTO public.band_songs VALUES ('01a0e904-6dc4-79ba-bc45-643adde7addb', '01a0e904-6d97-7a0d-a83b-9fc57682329b', 'Come As You Are 1790615776702.hv3ibojrguj', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:16:16.708+00', '2026-09-28 17:16:16.708+00');
INSERT INTO public.band_songs VALUES ('01a0e904-6e8c-778f-8241-c61c2a1d4b0d', '01a0e904-6e74-7db4-9fdc-8d6b741f111a', 'Come As You Are 1790615776903.31f296x52od', 'Drop D', 'E Minor', 120, 219, 'Letra da música...', 'Tocar mais devagar no refrão', '2026-09-28 17:16:16.908+00', '2026-09-28 17:16:16.908+00');
INSERT INTO public.band_songs VALUES ('01a0e906-0b5c-713d-90db-b586854faefa', '01a0e906-0b3c-7005-8813-fc1d9ba39a69', 'Come As You Are 1790615882582.eole1hnv7ms', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:18:02.588+00', '2026-09-28 17:18:02.588+00');
INSERT INTO public.band_songs VALUES ('01a0e906-0b68-73cf-bb5a-cc32b3bfa44b', '01a0e906-0b3c-7005-8813-fc1d9ba39a69', 'Come As You Are 1790615882594.1s6n9t6irbg', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-28 17:18:02.6+00', '2026-09-28 17:18:02.6+00');
INSERT INTO public.band_songs VALUES ('01a0e906-0c38-7b47-9d7d-2094f03e1d02', '01a0e906-0c1b-76b4-abba-d344efed6376', 'Come As You Are 1790615882798.fmuz2yifezu', 'Drop D', 'E Minor', 120, 219, 'Letra da música...', 'Tocar mais devagar no refrão', '2026-09-28 17:18:02.808+00', '2026-09-28 17:18:02.808+00');


--
-- TOC entry 3535 (class 0 OID 16534)
-- Dependencies: 217
-- Data for Name: bands; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.bands VALUES ('01a088e3-8eff-75f0-946e-2b9266c722a0', 'Dio Experience', 'Heavy Metal', 'Banda tributo ao Ronie James Dio', 'São Paulo', 'São Paulo', 'Jardim Ibirapuera', 'Rua Solar dos Quevedos, 06', 'Active', NULL, '2026-08-01', '2026-09-10 01:16:49.791+00', '2026-09-10 01:16:49.791+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8d0-9a74-79da-a631-dccf18393a1d', 'Lendas do Som', 'Doom Metal', 'Banda tributo a Black Sabbath que toca as músicas lado B com Ozzy Osbourne', 'São Paulo', 'São Paulo', 'Centro', 'Centro', 'Active', NULL, '2026-05-17', '2026-09-28 16:19:40.276+00', '2026-09-28 16:19:40.276+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-8714-70c4-844a-11667f4fc6b5', 'Band Setlist Song List E2E 1790615127823.aq7k26vuqc8', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:27.828+00', '2026-09-28 17:05:27.828+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-87f9-7b46-bba7-bf85a64f0ee3', 'Band Setlist Song List E2E 1790615128054.qklg74522dd', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:28.057+00', '2026-09-28 17:05:28.057+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-88aa-7914-9ac7-7247fcefb608', 'Band Setlist Song List E2E 1790615128231.4to6z7nndju', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:28.234+00', '2026-09-28 17:05:28.234+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-8934-7056-a796-69e4b4aa10e5', 'Band Setlist Song List E2E 1790615128368.x72ugu4rdhq', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:28.372+00', '2026-09-28 17:05:28.372+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-89bb-7046-b6eb-ab3578bc372b', 'Band Setlist Song List E2E 1790615128504.qvchbiqsxdg', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:28.507+00', '2026-09-28 17:05:28.507+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-8ab3-7bfc-95ba-153002b9baa1', 'Band Setlist Song List E2E 1790615128752.7du2dlykb74', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:28.755+00', '2026-09-28 17:05:28.755+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-ddba-72d0-b933-94c9fb8f9c19', 'Band Setlist Song List E2E 1790615150006.25wwtwf7s1f', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:50.01+00', '2026-09-28 17:05:50.01+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-8c26-7843-ba4b-bb8de54f1f1e', 'Band Setlist Song List E2E 1790615129123.d1mw1s5nfxe', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:29.126+00', '2026-09-28 17:05:29.126+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-8ca1-76e4-bbc7-34feb66e358b', 'Band Setlist Song List E2E 1790615129246.inxttfdw0i', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:29.249+00', '2026-09-28 17:05:29.249+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fa-8caa-7989-8b7c-6679c5ad7075', 'Band Setlist Song List E2E 1790615129255.v8s4uhouwgg', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:05:29.258+00', '2026-09-28 17:05:29.258+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-937b-720a-af93-57a2ee57060e', 'Band Setlist List E2E 1790615262052.dnts3uujx9t', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.075+00', '2026-09-28 17:07:42.075+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9383-7a9a-815d-4c4098d104bb', 'Band Setlist E2E 1790615262065.x9slnbr52s', 'Heavy Metal', 'Descrição da Banda', 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.084+00', '2026-09-28 17:07:42.084+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-938b-7306-8825-7c7eaec317ac', 'Nome da Banda', 'Heavy Metal', 'Descrição da Banda', 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.091+00', '2026-09-28 17:07:42.091+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9393-7ff8-9997-7f68a6499a9b', 'Band Setlist Song E2E 1790615262082.9d6oa1xgdfp', 'Heavy Metal', 'Descrição da Banda', 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.099+00', '2026-09-28 17:07:42.099+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-93a4-7de1-bfdb-bbb9624b2745', 'Band Song E2E 1790615262094.p5fm66lz72q', 'Heavy Metal', 'Descrição da Banda', 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.116+00', '2026-09-28 17:07:42.116+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-93c5-771e-8661-2f0e0f94a5d8', 'Band Song List E2E 1790615262124.mutjix2i2l', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.149+00', '2026-09-28 17:07:42.149+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-93ff-7b44-ad7c-1b39091b9829', 'Band Booking E2E 1790615262186.nhhbnw02yr', 'Heavy Metal', 'Descrição da Banda', 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.207+00', '2026-09-28 17:07:42.207+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-95dd-767c-82aa-848336409a8b', 'Band Setlist List E2E 1790615262667.1b6b1pih0x9i', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.685+00', '2026-09-28 17:07:42.685+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-962a-7a5e-a771-7d46ef846284', 'Band Song List E2E 1790615262739.nws3d04upfn', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.763+00', '2026-09-28 17:07:42.763+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-96a7-79ae-b6fc-d3cd7164f4c9', 'Band Owned By A', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.887+00', '2026-09-28 17:07:42.887+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-96f8-7e2d-bc6c-fed78f705371', 'Band Owned By B', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:42.968+00', '2026-09-28 17:07:42.968+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-97a7-7a16-b629-6b58672c2a49', 'Band Setlist List E2E 1790615263131.1qrg90ze815', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:43.143+00', '2026-09-28 17:07:43.143+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-97d9-7f9b-9ec2-ff51be5dbf84', 'Band Setlist List E2E 1790615263180.osn1mxfjx49', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:43.194+00', '2026-09-28 17:07:43.194+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-97f3-782e-a9a8-0da63ae39f5b', 'Band Song List E2E 1790615263205.ijr5p07lhj', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:43.22+00', '2026-09-28 17:07:43.22+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-982b-7d5b-ae63-b3b03ca0be0e', 'Band Song List E2E 1790615263262.lgeloiao8fh', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:43.276+00', '2026-09-28 17:07:43.276+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-98e6-7850-bc83-97072ffb945b', 'Band Setlist Song E2E 1790615263448.ayln57wtonl', 'Heavy Metal', 'Descrição da Banda', 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:43.462+00', '2026-09-28 17:07:43.462+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-997a-7b30-b330-97de10ab0fc0', 'Band Setlist Song E2E 1790615263595.qgoy46gyy9', 'Heavy Metal', 'Descrição da Banda', 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:43.61+00', '2026-09-28 17:07:43.61+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9a2c-77e9-9fed-ba0f0ead5a14', 'Band Only Owned By C', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:43.788+00', '2026-09-28 17:07:43.788+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9b41-7260-9d3b-da8345847efe', 'Band Setlist List E2E 1790615264053.ayhqcrob3hd', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:44.065+00', '2026-09-28 17:07:44.065+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9b6f-70ea-aaba-b6905376ddce', 'Band Song List E2E 1790615264102.2tnmgal1o9u', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:44.111+00', '2026-09-28 17:07:44.111+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9cef-790f-a1dc-415429b7bcf2', 'Band Setlist Song List E2E 1790615264481.rzvykjeb2fg', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:44.495+00', '2026-09-28 17:07:44.495+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9d78-7894-a599-a2fca53e46af', 'Band Setlist List E2E 1790615264627.wz7920l4dx', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:44.632+00', '2026-09-28 17:07:44.632+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9da0-71c5-b8eb-e142f827e683', 'Band Song List E2E 1790615264667.g7aj4jkkibp', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:44.672+00', '2026-09-28 17:07:44.672+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9eb4-7416-a8ee-53ea00aedb25', 'Band Setlist Song List E2E 1790615264941.rqxc80qtuio', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:44.948+00', '2026-09-28 17:07:44.948+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9f2f-72cd-a476-c6bf7c6cdcfa', 'Band Setlist List E2E 1790615265066.tzb2olujfb', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:45.071+00', '2026-09-28 17:07:45.071+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9f4e-7abf-a0c7-c143c37ab131', 'Band Song List E2E 1790615265098.9rhwdztbgnj', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:45.103+00', '2026-09-28 17:07:45.103+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-9fd5-7618-9c10-5d79187b882b', 'Band Setlist Song List E2E 1790615265233.vz3m6zpl1jd', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:45.237+00', '2026-09-28 17:07:45.237+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-a09c-7683-8f34-6a1a18dac493', 'Band Setlist Song List E2E 1790615265432.g2xav42j9og', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:45.436+00', '2026-09-28 17:07:45.436+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-a14f-7ba8-a052-9ecb3cabb7a1', 'Band Setlist Song List E2E 1790615265611.sl3815fs0od', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:45.615+00', '2026-09-28 17:07:45.615+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-a28c-785c-b384-1fdf5c86b1f0', 'Band Setlist Song List E2E 1790615265928.ikjkd0o67do', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:45.932+00', '2026-09-28 17:07:45.932+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-a3be-7354-8a1c-80afb0ecd723', 'Band Setlist Song List E2E 1790615266234.ahi50o3ddkd', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:46.238+00', '2026-09-28 17:07:46.238+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-a45e-7b23-af13-fc67af183748', 'Band Setlist Song List E2E 1790615266393.9obotjqiadl', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:46.398+00', '2026-09-28 17:07:46.398+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-a4f6-7629-9f9f-f4c74cc34b94', 'Band Setlist Song List E2E 1790615266546.wa1uktt9vdc', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:46.55+00', '2026-09-28 17:07:46.55+00', NULL);
INSERT INTO public.bands VALUES ('01a0e8fc-a504-7a51-9a5e-631272d700d8', 'Band Setlist Song List E2E 1790615266561.pxtlezzdm7k', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:07:46.564+00', '2026-09-28 17:07:46.564+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-6d97-7a0d-a83b-9fc57682329b', 'Band Setlist Song List E2E 1790615776657.b2isf06ivsb', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:16.663+00', '2026-09-28 17:16:16.663+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-6e74-7db4-9fdc-8d6b741f111a', 'Band Setlist Song List E2E 1790615776881.y0zny4j5toc', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:16.885+00', '2026-09-28 17:16:16.885+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-6f24-79b9-ac36-a535f94c070d', 'Band Setlist Song List E2E 1790615777057.0wzgyhxb9z3', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:17.06+00', '2026-09-28 17:16:17.06+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-6fb7-79a3-bd79-73d21c86554a', 'Band Setlist Song List E2E 1790615777204.jqutiarz93', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:17.207+00', '2026-09-28 17:16:17.207+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-7047-70e7-b82b-972a53dad25c', 'Band Setlist Song List E2E 1790615777348.rurgufjpj8j', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:17.351+00', '2026-09-28 17:16:17.351+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-714b-7793-b7cb-fab53e35e100', 'Band Setlist Song List E2E 1790615777608.vrru229x7tb', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:17.611+00', '2026-09-28 17:16:17.611+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-724d-7c85-9c0e-88e8af6ff273', 'Band Setlist Song List E2E 1790615777866.ef1ka7onf3m', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:17.869+00', '2026-09-28 17:16:17.869+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-72d6-7cc9-8633-03e7d6431d7c', 'Band Setlist Song List E2E 1790615778003.d7g9e4llfpp', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:18.006+00', '2026-09-28 17:16:18.006+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-735d-70af-9973-6fefd72b0479', 'Band Setlist Song List E2E 1790615778138.ng2chhv8srd', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:18.141+00', '2026-09-28 17:16:18.141+00', NULL);
INSERT INTO public.bands VALUES ('01a0e904-7367-7b98-a630-1da9e3946fba', 'Band Setlist Song List E2E 1790615778147.3zrmznb1v66', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:16:18.151+00', '2026-09-28 17:16:18.151+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-0b3c-7005-8813-fc1d9ba39a69', 'Band Setlist Song List E2E 1790615882551.nrhl8r07oo', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:02.556+00', '2026-09-28 17:18:02.556+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-0c1b-76b4-abba-d344efed6376', 'Band Setlist Song List E2E 1790615882775.8mdc0jb5tbs', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:02.779+00', '2026-09-28 17:18:02.779+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-0ccb-75f4-8f89-8040acd92839', 'Band Setlist Song List E2E 1790615882952.vfcqzgf4cep', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:02.955+00', '2026-09-28 17:18:02.955+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-0d57-7d10-a6aa-77b109dec364', 'Band Setlist Song List E2E 1790615883092.p098dw2ihp', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:03.095+00', '2026-09-28 17:18:03.095+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-0ddf-7b15-bb23-0183deeb3aa1', 'Band Setlist Song List E2E 1790615883228.afn2wq987is', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:03.231+00', '2026-09-28 17:18:03.231+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-0edb-7517-b9c9-35f50b4a0515', 'Band Setlist Song List E2E 1790615883480.rd5b8b91ug', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:03.483+00', '2026-09-28 17:18:03.483+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-0fdc-74cf-807f-3b7f64b5c1c8', 'Band Setlist Song List E2E 1790615883737.bm0m19peizh', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:03.74+00', '2026-09-28 17:18:03.74+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-1064-773f-badc-591e8ab6d8c1', 'Band Setlist Song List E2E 1790615883873.tcy9p4kwt3e', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:03.876+00', '2026-09-28 17:18:03.876+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-10e4-7d85-baf5-80d77ac5e3b5', 'Band Setlist Song List E2E 1790615884001.ldbqzmv3ppl', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:04.004+00', '2026-09-28 17:18:04.004+00', NULL);
INSERT INTO public.bands VALUES ('01a0e906-10ed-773a-a05b-1eed314fd784', 'Band Setlist Song List E2E 1790615884010.9x31hitnp8f', 'Heavy Metal', NULL, 'São Paulo', 'São Paulo', 'Centro', 'Avenida Paulista, 1000', 'Active', NULL, '2026-05-31', '2026-09-28 17:18:04.013+00', '2026-09-28 17:18:04.013+00', NULL);


--
-- TOC entry 3534 (class 0 OID 16526)
-- Dependencies: 216
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.migrations VALUES (1, 1780368748378, 'CreateBandsTable1780368748378');
INSERT INTO public.migrations VALUES (2, 1782957405196, 'CreateUsersTable1782957405196');
INSERT INTO public.migrations VALUES (3, 1784651680416, 'CreateBandMembersTable1784651680416');
INSERT INTO public.migrations VALUES (4, 1784674324900, 'CreateBandSongsTable1784674324900');
INSERT INTO public.migrations VALUES (5, 1785793468320, 'CreateBandSetlistsTable1785793468320');
INSERT INTO public.migrations VALUES (6, 1785797863795, 'CreateBandSetlistSongsTable1785797863795');
INSERT INTO public.migrations VALUES (7, 1786145039439, 'CreateBandBookingsTable1786145039439');
INSERT INTO public.migrations VALUES (8, 1786580209116, 'CreateUserContactsTable1786580209116');
INSERT INTO public.migrations VALUES (9, 1787285512757, 'LinkBandBookingContact1787285512757');


--
-- TOC entry 3542 (class 0 OID 16639)
-- Dependencies: 224
-- Data for Name: user_contacts; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.user_contacts VALUES ('01a0e8fc-93a6-74ae-95b4-083d5f9c1717', '01a0e8fc-9279-78a3-ac35-ef8714e47ff6', 'Maria Souza 1790615262099.mouyzj1kq2a', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:42.118+00', '2026-09-28 17:07:42.118+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-93d6-7c21-8045-a1bc34245550', '01a0e8fc-9279-78a3-ac35-ef8714e47ff6', 'Maria Souza 1790615262156.quo032ygbw8', '11987654321', '1133654321', 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', 'Prefere contato via WhatsApp', '2026-09-28 17:07:42.166+00', '2026-09-28 17:07:42.166+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-93fe-72d9-9eb4-08d9c29e58af', '01a0e8fc-9279-78a3-ac35-ef8714e47ff6', 'Maria Souza 1790615262191.rd0g6yv57rr', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:42.206+00', '2026-09-28 17:07:42.206+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-9441-7593-be41-012b4ad9d378', '01a0e8fc-930e-7ece-8747-ace16db3c22b', 'Maria Souza 1790615262260.jcb8jr1ifhm', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:42.273+00', '2026-09-28 17:07:42.273+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-9689-76ad-9898-61b930f98bec', '01a0e8fc-9450-7204-ae72-472359cc59d8', 'Contact A 1790615262843.nfgsi05mose', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:42.857+00', '2026-09-28 17:07:42.857+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-96aa-79cf-88ca-4741c07f523c', '01a0e8fc-95b5-7114-b507-7b4b72f58c62', 'Contact B 1790615262878.w3jtty7xqc', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:42.89+00', '2026-09-28 17:07:42.89+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-97e5-7794-a5b4-4e01e1a39aee', '01a0e8fc-96fe-7fa7-85d3-f3c8dbdae70d', 'Maria Souza 1790615263196.fkcju1llc1p', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:43.206+00', '2026-09-28 17:07:43.206+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-9877-746f-a537-bbecae5a1da6', '01a0e8fc-978b-79f8-9d9d-7b1ede5c9b68', 'First Contact 1790615263309.ppzj9ahifw', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:43.351+00', '2026-09-28 17:07:43.351+00');
INSERT INTO public.user_contacts VALUES ('01a0e8fc-989a-74aa-9431-c847187f23de', '01a0e8fc-978b-79f8-9d9d-7b1ede5c9b68', 'Second Contact 1790615263309.ox2p131x05', '11987654321', NULL, 'Bar do Zé', 'Rua das Flores, 123 - São Paulo/SP', 'contato@bardoze.com', 'Produtor', NULL, '2026-09-28 17:07:43.386+00', '2026-09-28 17:07:43.386+00');


--
-- TOC entry 3536 (class 0 OID 16545)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: band_tools
--

INSERT INTO public.users VALUES ('01a088df-1545-74c4-9266-c5c33942e835', 'Orlando', 'Nascimento', 'ocnascimento2@gmail.com', '11912345678', '$2b$10$YTrrwBJ0k7sNEWX20MzqaehN8yZjg1biX7bPL0U.jtO5dHtBrkDYK', NULL, '2026-09-10 01:11:56.486+00', '2026-09-10 01:11:56.486+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-86c7-7cc0-9ebc-61121d66f53e', 'John', 'Lennon', 'band.setlist.song.list.1790615127651.b2sgkfa8s3u@example.com', '11912345678', '$2b$10$2ye1DEzpL1ljNy4iQpbfR.IWd3LUQS6T5Bhd1XtWOiNlibqqur7Na', NULL, '2026-09-28 17:05:27.752+00', '2026-09-28 17:05:27.752+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-87b9-7ee7-b7c2-e6fcabcba133', 'John', 'Lennon', 'band.setlist.song.list.1790615127940.ulxha0afgua@example.com', '11912345678', '$2b$10$vUHSE70rhpnZtbByfUlEhek4OvfbhExIm4Jt5nyQzgBAyLG/01wo6', NULL, '2026-09-28 17:05:27.993+00', '2026-09-28 17:05:27.993+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-886a-7b0b-a532-703fc9016ae9', 'John', 'Lennon', 'band.setlist.song.list.1790615128119.msk09830idh@example.com', '11912345678', '$2b$10$uAdv./SWe0tNVmGPHffqMuHlHgLjgUExTjf.vBGwH5iVRsRK4Arju', NULL, '2026-09-28 17:05:28.17+00', '2026-09-28 17:05:28.17+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-88f6-72f2-b7c7-5624b853c800', 'John', 'Lennon', 'band.setlist.song.list.1790615128257.clcchmslxbo@example.com', '11912345678', '$2b$10$so0uS.Sn/AmTTXcZlZ.gUOI0OrzBIaIbUgWkRbWs9gS9Ia96GMwvC', NULL, '2026-09-28 17:05:28.31+00', '2026-09-28 17:05:28.31+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-897d-7443-ae41-ab078f182b2f', 'John', 'Lennon', 'band.setlist.song.list.1790615128392.nc3skfmyw1l@example.com', '11912345678', '$2b$10$aJUKApjhvxh0B4Qk2CV5l.Vm9T5rKSmjxBHv3QzLVGm9VPqwdXMoa', NULL, '2026-09-28 17:05:28.445+00', '2026-09-28 17:05:28.445+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-8a75-7421-86a0-a123b2ce6a9e', 'John', 'Lennon', 'band.setlist.song.list.1790615128642.bpju2mfdylg@example.com', '11912345678', '$2b$10$0zlncQ36DTDcCIidxRvKcuFxitKxZFKNFYjHYeqeTfuFh5bmW8xci', NULL, '2026-09-28 17:05:28.693+00', '2026-09-28 17:05:28.693+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-8af6-7549-b03b-70e05ba8aea4', 'John', 'Lennon', 'band.setlist.song.list.1790615128773.4wi7kxctsti@example.com', '11912345678', '$2b$10$szbJz1gkiks2/S78sDN.ReUOc5p8sorYmoOx1stoX9zSswIfn3X5u', NULL, '2026-09-28 17:05:28.822+00', '2026-09-28 17:05:28.822+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-8b67-700e-9a1c-e4189ac85d02', 'John', 'Lennon', 'band.setlist.song.list.1790615128886.lj18juouek@example.com', '11912345678', '$2b$10$ja4ROZsJDKNhw3lywkjeCeWPhSu0pWuYAmhSWL7iUCVzko7yJR7u.', NULL, '2026-09-28 17:05:28.935+00', '2026-09-28 17:05:28.935+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-ddff-7e8c-8a2e-c17d4aa73c8e', 'John', 'Lennon', 'band.setlist.song.list.1790615150029.p8i2ai01nnr@example.com', '11912345678', '$2b$10$0Avk4BKeI/gK1cznSBJOu.e0TZ1aUPak1IM6nP062FHeBjJMKWhFe', NULL, '2026-09-28 17:05:50.079+00', '2026-09-28 17:05:50.079+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fa-8c65-763a-ba45-f6505a7fa5ad', 'John', 'Lennon', 'band.setlist.song.list.1790615129138.rxiqfh4lkvj@example.com', '11912345678', '$2b$10$bKfMbFswXuaNy0X9oEZ7nuNJ4h3EM.uLelFaWvORwG5M/MzeNTkFu', NULL, '2026-09-28 17:05:29.189+00', '2026-09-28 17:05:29.189+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9274-73b1-bf9c-40e6a74b5cc6', 'John', 'Lennon', 'band.owner.1790615261520.cycequh26gu@example.com', '11912345678', '$2b$10$RLHLwW2FonmbhpntF0Zf8eyylgDB3NwCL5FCfHKTD0x1Z3FkZjyK2', NULL, '2026-09-28 17:07:41.813+00', '2026-09-28 17:07:41.813+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9279-78a3-ac35-ef8714e47ff6', 'John', 'Lennon', 'user.contact.1790615261507.easn7zagl6i@example.com', '11912345678', '$2b$10$o6zZ/rcQnhU1yEhWYde6mOHJIdIfFBj8/w6.rhk/1ovyI58uyaAVG', NULL, '2026-09-28 17:07:41.818+00', '2026-09-28 17:07:41.818+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9278-74a9-8885-85e827e1c671', 'John', 'Lennon', 'band.setlist.list.1790615261505.t7kn76q0cxn@example.com', '11912345678', '$2b$10$Ouxq8mK49fQbl7eyzwG/Q.lF6Dxy//v9NSlPStHw5MJIWjFTJ4ROq', NULL, '2026-09-28 17:07:41.817+00', '2026-09-28 17:07:41.817+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-928e-7d6b-a348-f1aef717bc06', 'John', 'Lennon', 'band.setlist.1790615261509.0dgtkodwq35r@example.com', '11912345678', '$2b$10$aC0tOP9.BzalmlYHI00dM.uydOISKWp3aEU/pamyQBOtvvlqtwBfi', NULL, '2026-09-28 17:07:41.839+00', '2026-09-28 17:07:41.839+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9297-7147-b32a-c2ae79f0f23d', 'John', 'Lennon', 'band.song.1790615261513.np23ousmtdk@example.com', '11912345678', '$2b$10$D2fEyQVhjfoKFuODtG6kAetenCmfd5FLYzT.VxlUx9dCpQ2Gx8BKq', NULL, '2026-09-28 17:07:41.848+00', '2026-09-28 17:07:41.848+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-929d-7609-99ce-a9850a56a418', 'John', 'Lennon', 'contact.list.empty.1790615261621.34a7sixjsjs@example.com', '11912345678', '$2b$10$tinnDc.dbsKyOBsdb8tfo.zas2MJSbqoiJdO1WHTvzd6QNOswumta', NULL, '2026-09-28 17:07:41.853+00', '2026-09-28 17:07:41.853+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9296-7891-9280-52b3b13a3aae', 'John', 'Lennon', 'john.lennon.1790615261520.w0ii52444u@example.com', '11912345678', '$2b$10$bEdqAHhkq.bp/0tUVRNHteErtk74tBy55ZX9CUfqFEXLTjcFxE1jC', NULL, '2026-09-28 17:07:41.847+00', '2026-09-28 17:07:41.847+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-92a2-72be-8f2b-46db0ec7d2c2', 'John', 'Lennon', 'band.setlist.song.1790615261537.qdk8k4evpo@example.com', '11912345678', '$2b$10$vzBgQz9omgqEUhaAr6LTVeolCLDw30szC.38J7LqpYpAJc8TAx97C', NULL, '2026-09-28 17:07:41.859+00', '2026-09-28 17:07:41.859+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-92a9-7733-9022-7ea7c3ef8e61', 'John', 'Lennon', 'band.list.empty.1790615261625.4ssfnrxogzq@example.com', '11912345678', '$2b$10$OXUg6RhqvX4Je2N8AYhZSeTA2a7b5ybtOwcWphpTIk/qCW.LTpht6', NULL, '2026-09-28 17:07:41.866+00', '2026-09-28 17:07:41.866+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-92a9-78a0-b869-8e36cde7e210', 'John', 'Lennon', 'band.song.list.1790615261563.1fq91yqyqqq@example.com', '11912345678', '$2b$10$WvaeziOUoYM74Yd6M8RCP.mUUd6Gpo7jMmaX6ZwTcq2hVncepl0r2', NULL, '2026-09-28 17:07:41.866+00', '2026-09-28 17:07:41.866+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-930e-7ece-8747-ace16db3c22b', 'John', 'Lennon', 'band.booking.1790615261703.sx47mbx5qed@example.com', '11912345678', '$2b$10$1U0DozxOWsC77M3Vj.EN5.j40P9QVBLVRRKo37gNuO3HHkss.db/i', NULL, '2026-09-28 17:07:41.967+00', '2026-09-28 17:07:41.967+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9432-7a79-bfdd-6b8417ad10dd', 'John', 'Lennon', 'john.lennon.1790615262111.cbfflsc814w@example.com', '11912345678', '$2b$10$XhQbeBlUgb.pcrqReds12OdRE.psib3YSdaW4jlysxCsaPcu5FD1G', NULL, '2026-09-28 17:07:42.258+00', '2026-09-28 17:07:42.258+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9444-78b4-b892-0caafa60c769', 'John', 'Lennon', 'band.list.owner.1790615262122.ijzo44jpzzh@example.com', '11912345678', '$2b$10$amYga2UoIdSY7ZRiQzNAQOsu1LDYJUiay3KsFYiGe.CYLLk6UtE3O', NULL, '2026-09-28 17:07:42.276+00', '2026-09-28 17:07:42.276+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9450-7204-ae72-472359cc59d8', 'John', 'Lennon', 'contact.list.owner.1790615262136.o3b0ygc57x@example.com', '11912345678', '$2b$10$v7Z1YI2en/8CpYBw0p310.03zh3WtFi32PIzOTNiPTXm24xHJgKfW', NULL, '2026-09-28 17:07:42.288+00', '2026-09-28 17:07:42.288+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-94ef-7658-bbd1-d2b86f4b38ef', 'John', 'Lennon', 'band.setlist.list.1790615262286.3t3cnne3gm8@example.com', '11912345678', '$2b$10$5B/K2x5SGob7LlFmqBmXWOpAkNpIIcj/8FAU2DUPOL7UXox8cPosi', NULL, '2026-09-28 17:07:42.448+00', '2026-09-28 17:07:42.448+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9556-7259-89f2-906aabe0f3b2', 'John', 'Lennon', 'band.song.list.1790615262382.mxzsv4180bs@example.com', '11912345678', '$2b$10$Nhd1iXqQdSEXf/EJQdNrX.k00TELMdcdrvwZy7a6imRi/4CwEgyaC', NULL, '2026-09-28 17:07:42.55+00', '2026-09-28 17:07:42.55+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-95b5-7114-b507-7b4b72f58c62', 'John', 'Lennon', 'contact.list.other.1790615262481.wb9iugl8tw@example.com', '11912345678', '$2b$10$gCV4fnEm8urhIa7tt3RoE.ztU51XeQCN2uCVvORfA8zBUv1EHMgEu', NULL, '2026-09-28 17:07:42.645+00', '2026-09-28 17:07:42.645+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-95cc-7a49-a1f3-f1c23a52cfca', 'John', 'Lennon', 'band.list.member.1790615262493.a54payll2z@example.com', '11912345678', '$2b$10$ive9lGhePWOe0WKtr32TnOzbwKzHguP1vWjumWOp34zaGqEcbGzNK', NULL, '2026-09-28 17:07:42.669+00', '2026-09-28 17:07:42.669+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-96d6-7bd1-b7ea-10e27cfea442', 'John', 'Lennon', 'band.setlist.list.1790615262779.k0az7mw8b0l@example.com', '11912345678', '$2b$10$iEPs/uKEVN09CzLBE1IFJe4uRR/jcuK.Z3BD6kHZKMNX6PeGTW55C', NULL, '2026-09-28 17:07:42.934+00', '2026-09-28 17:07:42.934+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-96f9-72d5-ac30-f223c8933248', 'John', 'Lennon', 'band.setlist.1790615262813.vfpnpa25s9@example.com', '11912345678', '$2b$10$kc.YJkrunqZAqQSENqstmul7glF135aWf7lB8.2EPuXQFvbqTataO', NULL, '2026-09-28 17:07:42.969+00', '2026-09-28 17:07:42.969+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-96fe-7fa7-85d3-f3c8dbdae70d', 'John', 'Lennon', 'band.booking.1790615262814.34ck4765wuh@example.com', '11912345678', '$2b$10$vIYqLydgUzk3CFt.gAZSUOato8sr.XgV0/ZFdf6n0nlXAlroxfdYS', NULL, '2026-09-28 17:07:42.974+00', '2026-09-28 17:07:42.974+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9727-7011-a620-cd65206919ce', 'John', 'Lennon', 'band.song.list.1790615262851.6ylw5ya0uva@example.com', '11912345678', '$2b$10$Z0ZjiyzdjGxLXezUfzQ8sOy/5FM1W8GqJar1J6vtbbUhASOQECP72', NULL, '2026-09-28 17:07:43.015+00', '2026-09-28 17:07:43.015+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-978b-79f8-9d9d-7b1ede5c9b68', 'John', 'Lennon', 'contact.list.ordered.1790615262929.s2xi7kn8z9n@example.com', '11912345678', '$2b$10$EgF4r/pbvePCwZF1v9Pe1emb3zsXdXTf6FyyEcwXo5tTOzZWHZv0O', NULL, '2026-09-28 17:07:43.115+00', '2026-09-28 17:07:43.115+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-97ae-7356-895a-517f9cb604ed', 'John', 'Lennon', 'band.song.1790615262948.nx6ctx66ppa@example.com', '11912345678', '$2b$10$NKoCOScx86MEVNYZskbeQOqVUzpkupaDRw10kktLlL7bm9gdbD4YW', NULL, '2026-09-28 17:07:43.15+00', '2026-09-28 17:07:43.15+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-97ca-7eb3-8eef-da9df8fbdf2b', 'John', 'Lennon', 'band.setlist.song.1790615262983.6bm84fzyu49@example.com', '11912345678', '$2b$10$DdUKNueD/68Yl2lO5xnBfOwukRhVy/nxhWVcy69PIi9Py9z.PghQy', NULL, '2026-09-28 17:07:43.178+00', '2026-09-28 17:07:43.178+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-97fa-7161-993c-215ef7d566aa', 'John', 'Lennon', 'band.list.isolated-a.1790615263066.g0fg4m8a0u7@example.com', '11912345678', '$2b$10$72Rwmx1IdjSa4gszUKrj1ux6mUdI6sOQTIHfv2NjSYW2GMR1PR4DO', NULL, '2026-09-28 17:07:43.226+00', '2026-09-28 17:07:43.226+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-992d-7b1c-a49d-d9e850514c84', 'John', 'Lennon', 'band.setlist.list.1790615263347.orkjfysdqsa@example.com', '11912345678', '$2b$10$XAJS5l78d.kHidwGtT4sPO2OWD/D7zxhsrW2g8pJP92RE6wbVsXQe', NULL, '2026-09-28 17:07:43.533+00', '2026-09-28 17:07:43.533+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9943-7495-a096-b5c32b990717', 'John', 'Lennon', 'band.song.list.1790615263398.sub3hpusbs9@example.com', '11912345678', '$2b$10$x1gudQ7u4lr5qjHghCsZFO2egWkktlNtd2du.Azh5Lv8A5ggjnp0W', NULL, '2026-09-28 17:07:43.555+00', '2026-09-28 17:07:43.555+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9ac7-7d53-9ba9-7057c3a36d1f', 'John', 'Lennon', 'band.song.list.1790615263785.kkfp2lv82b@example.com', '11912345678', '$2b$10$RBKlD5s0kTbjwyuL7vyr2.ioJ7VV1hFw9YcjicF9keYmYGyB0rn5u', NULL, '2026-09-28 17:07:43.943+00', '2026-09-28 17:07:43.943+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9d24-7773-8121-747eed2fa7e1', 'John', 'Lennon', 'band.song.list.1790615264435.ztzhshg9r5m@example.com', '11912345678', '$2b$10$yYRmbSzujUF80r04f27wx.eSO88bKN3m9/8iWG0nNj5sVS8e1Cufe', NULL, '2026-09-28 17:07:44.549+00', '2026-09-28 17:07:44.549+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9e13-7287-a1bb-f0960a059f67', 'John', 'Lennon', 'band.song.list.1790615264687.72yhffvdmsd@example.com', '11912345678', '$2b$10$ZPAf2sf/DEskpJ2rTJ31KulL.NCD0Bp0qyCeszVxICEVk7hvBBXgC', NULL, '2026-09-28 17:07:44.787+00', '2026-09-28 17:07:44.787+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9ee3-7fa4-b833-aaa1cf1c0763', 'John', 'Lennon', 'band.song.list.1790615264904.k2s12ggjm5@example.com', '11912345678', '$2b$10$vUtmnQEo7BjFs20iyaaZ4uSbAA09c35RW65PMGn1xB7xsJYPMx1QK', NULL, '2026-09-28 17:07:44.995+00', '2026-09-28 17:07:44.995+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9969-7c41-9c42-0ae2e0edd08e', 'John', 'Lennon', 'band.list.isolated-c.1790615263429.i6c4yd6xftl@example.com', '11912345678', '$2b$10$ocXYzggZO1TLPPjChr3rKeDPg4TlS/zSzoa8bnJvJ2a1nP/EOhzoy', NULL, '2026-09-28 17:07:43.593+00', '2026-09-28 17:07:43.593+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-edaf-71d0-b0a9-af1c6d5a0f03', 'John', 'Lennon', 'band.booking.1790615264006.2lwwjb9pyuf@example.com', '11912345678', '$2b$10$v4o/wVmsc6RN/iDzOnwX5uTcq9aT5BGKrqGGI8aYFCsMaI4T6x7Zu', NULL, '2026-09-28 17:08:05.167+00', '2026-09-28 17:08:05.167+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9a91-74ec-a9f2-a71539356fa9', 'John', 'Lennon', 'band.setlist.list.1790615263735.f98mq25ctxb@example.com', '11912345678', '$2b$10$y/uMJq1WdfFBbfD4SCj4Bekz8iLkUrsa6rfj4RemWZ8eHohD6oala', NULL, '2026-09-28 17:07:43.889+00', '2026-09-28 17:07:43.889+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9c52-7280-8d9a-c1d4c7102650', 'John', 'Lennon', 'band.setlist.song.list.1790615285176.a0y83hh8yhk@example.com', '11912345678', '$2b$10$mMmGJ745c1jNbduKjNXcm.vO6D8dBEbxDQGYjbpqffYaDG.YjBNlW', NULL, '2026-09-28 17:07:44.338+00', '2026-09-28 17:07:44.338+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9c55-768d-a017-891d008f8093', 'John', 'Lennon', 'john.lennon.1790615285198.27v29fkfd7u@example.com', '11912345678', '$2b$10$b.MEYMPMhyQ5EyIgbm.xjuT/uEJjHFQnPmO.D8JxrXedUXjL/FHwC', NULL, '2026-09-28 17:07:44.342+00', '2026-09-28 17:07:44.342+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9cf9-734e-91ca-1a755c138f6b', 'John', 'Lennon', 'band.setlist.list.1790615264391.42em66gk17a@example.com', '11912345678', '$2b$10$KAYAUp7TtfkGpNwznDC3lOKbInU1ZiLQULkBVBTwJT2Z.Wpbv.yLy', NULL, '2026-09-28 17:07:44.505+00', '2026-09-28 17:07:44.505+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9cfa-7a5f-8dc8-97953ae81ef6', 'John', 'Lennon', 'john.lennon.1790615264394.my72t31z4v@example.com', '11912345678', '$2b$10$B9tEsQQxB2FsdhzT0/9wz.59DBrm10EW3YIft8S0WzJTgdcKCosLa', NULL, '2026-09-28 17:07:44.506+00', '2026-09-28 17:07:44.506+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9dee-7d72-aec6-373f17b6aec4', 'John', 'Lennon', 'band.setlist.list.1790615264649.y8tnuwijlsf@example.com', '11912345678', '$2b$10$Riz.Ce1aMT4qgMniueEf/uBORtS4bUDurh24VkCkG2Qo5m1ArdtXi', NULL, '2026-09-28 17:07:44.751+00', '2026-09-28 17:07:44.751+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9e3e-719c-854f-37712d7723bb', 'John', 'Lennon', 'band.setlist.song.list.1790615264726.omgmogrne2@example.com', '11912345678', '$2b$10$5oI/pw.xINM9qxDMIXzrye4aWutvfD/u2CRuCrr1Dgvqx/xSRLm9m', NULL, '2026-09-28 17:07:44.83+00', '2026-09-28 17:07:44.83+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9ec3-772e-a7bc-53f66b1b1109', 'John', 'Lennon', 'band.setlist.list.1790615264869.0iqp0kl0mbj@example.com', '11912345678', '$2b$10$q00C9GeHPJa0N1HJFpGqO.T2qN77RUwVaWpvxrxUD/fJw.UZMilmq', NULL, '2026-09-28 17:07:44.963+00', '2026-09-28 17:07:44.963+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-9f74-7f06-b4f9-76cb589068fd', 'John', 'Lennon', 'band.setlist.song.list.1790615265047.153pavy077i@example.com', '11912345678', '$2b$10$gwl2C/7GUYSs18ULoVlWdeLjiHXHoH/KsqeFL1kMv6K394I3/NQHG', NULL, '2026-09-28 17:07:45.14+00', '2026-09-28 17:07:45.14+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-a049-7065-b819-c3b8efa62486', 'John', 'Lennon', 'band.setlist.song.list.1790615265271.l8qaz3kj7qj@example.com', '11912345678', '$2b$10$2QAJeQwleP2lb.m.IoMEQuOvCd7FrmknvSruvrRS9zZGbKGGljcGS', NULL, '2026-09-28 17:07:45.353+00', '2026-09-28 17:07:45.353+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-a0fb-72a0-aab8-d493f63b34dd', 'John', 'Lennon', 'band.setlist.song.list.1790615265461.5s4j341y4hx@example.com', '11912345678', '$2b$10$IolDNhakeF1tDqEQbquIFuARB4wVISsyzZBllsa3EUZvxePf4FJjC', NULL, '2026-09-28 17:07:45.531+00', '2026-09-28 17:07:45.531+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-a241-7712-a727-49eeafcea1bc', 'John', 'Lennon', 'band.setlist.song.list.1790615265789.1hfi3ortjuk@example.com', '11912345678', '$2b$10$jIdg40dK/5k3U9OCiNw90OqoQI8ARKXMemwNoUzKBV9xNn2fmwjYC', NULL, '2026-09-28 17:07:45.857+00', '2026-09-28 17:07:45.857+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-a2e1-709b-9a22-c8a5b633f5fb', 'John', 'Lennon', 'band.setlist.song.list.1790615265951.nrbvhaxk3ke@example.com', '11912345678', '$2b$10$yJenIW40a1X6PA/Wnp6sF.kwQEJqeReZiujdIyFYV0CN6s.MHcJtu', NULL, '2026-09-28 17:07:46.017+00', '2026-09-28 17:07:46.017+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-a372-705b-8d71-b06b88d478c6', 'John', 'Lennon', 'band.setlist.song.list.1790615266097.xm2dh5gzzj@example.com', '11912345678', '$2b$10$qh5MD781IYVrXpA25TDmU.1JXjAPB2qTeLHL74.mdJQgHU2yG3aka', NULL, '2026-09-28 17:07:46.162+00', '2026-09-28 17:07:46.162+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-a414-7ed5-b9b2-539581af81b5', 'John', 'Lennon', 'band.setlist.song.list.1790615266259.3357jaa52zq@example.com', '11912345678', '$2b$10$M2njAJDedzGF8L5I0gHOJeopI7mciTbRdL2vqeNLRxkVCfTwWIJJm', NULL, '2026-09-28 17:07:46.324+00', '2026-09-28 17:07:46.324+00', NULL);
INSERT INTO public.users VALUES ('01a0e8fc-a4ad-76ee-a537-83a33d82176b', 'John', 'Lennon', 'band.setlist.song.list.1790615266415.96pzu6yjl0j@example.com', '11912345678', '$2b$10$LCmi.GtZJHJsgUFzgdqq/OAvEprNnCWnQNOWZ/LFSXez3ibusz.6.', NULL, '2026-09-28 17:07:46.477+00', '2026-09-28 17:07:46.477+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-6d40-7142-86bc-ddf4288b6ed5', 'John', 'Lennon', 'band.setlist.song.list.1790615776481.idq72g7g6y@example.com', '11912345678', '$2b$10$DVRtQGnsCCGkH803U80pPuobhh/EAgyT8H3SVYsTYYuT/PZKvNwti', NULL, '2026-09-28 17:16:16.576+00', '2026-09-28 17:16:16.576+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-6e31-7006-a8b0-621fba884e9c', 'John', 'Lennon', 'band.setlist.song.list.1790615776759.7n2324nazpa@example.com', '11912345678', '$2b$10$75Vu7OYHZvz0ejEDf1aZXeW1NQBPvG1mFkeb4rkX2a/UcYTtnUP7O', NULL, '2026-09-28 17:16:16.818+00', '2026-09-28 17:16:16.818+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-6ee2-7992-9e4e-2347b386e0e0', 'John', 'Lennon', 'band.setlist.song.list.1790615776939.nau7ieh3jvn@example.com', '11912345678', '$2b$10$B0VsxhP6I4TnW92BQCicG.8qLQOzyOa5q4BTLWmmugyfosVnOBk8.', NULL, '2026-09-28 17:16:16.994+00', '2026-09-28 17:16:16.994+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-6f75-7c28-993f-19b3c9fffc4e', 'John', 'Lennon', 'band.setlist.song.list.1790615777086.pisurub1n5@example.com', '11912345678', '$2b$10$gDwmD0xLQS3Iq6HHN6T3r.1qOVkr8W9Zy61fIrSijxYgILnedEkw6', NULL, '2026-09-28 17:16:17.141+00', '2026-09-28 17:16:17.141+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-7007-7f91-8e98-1e9ca970d9b9', 'John', 'Lennon', 'band.setlist.song.list.1790615777230.l3fcb74oqfd@example.com', '11912345678', '$2b$10$1MJP45ffH4.HuXQ5nvP2Fekvc6XUgL5g1yU4ZjEbpMfwdgJKe1Ely', NULL, '2026-09-28 17:16:17.287+00', '2026-09-28 17:16:17.287+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-710a-7946-975b-92b0bef70dc5', 'John', 'Lennon', 'band.setlist.song.list.1790615777492.p0gurjvar8q@example.com', '11912345678', '$2b$10$kawcvngVuKtAyeSJ/XFhdepnp/U3PqSrO.rT1XTwR3hyh6G8sCi9u', NULL, '2026-09-28 17:16:17.546+00', '2026-09-28 17:16:17.546+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-7191-7457-90b1-2d78d67dfc05', 'John', 'Lennon', 'band.setlist.song.list.1790615777628.ehxfx0rwyje@example.com', '11912345678', '$2b$10$bOOyZ13tcWC4wmdYRS1OCeP9SOevIFfkgcVg6jsrapPPqyoyvkqCO', NULL, '2026-09-28 17:16:17.681+00', '2026-09-28 17:16:17.681+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-720d-78b0-a068-cc0fcc5b723c', 'John', 'Lennon', 'band.setlist.song.list.1790615777751.pf54to1rykc@example.com', '11912345678', '$2b$10$7LPHvp7eJVEBJ1FwNt9g1.KlzWAKs.IGpVTYFQzPCXA1Q68mplaz2', NULL, '2026-09-28 17:16:17.805+00', '2026-09-28 17:16:17.805+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-7296-73fc-a476-9f252d5ad42e', 'John', 'Lennon', 'band.setlist.song.list.1790615777887.vcn37ihqf1q@example.com', '11912345678', '$2b$10$hIgFAnEDl8pGmtEVi1CcKezH/XbLRwZT2fb6/p2yNn4KilSLXwhRu', NULL, '2026-09-28 17:16:17.942+00', '2026-09-28 17:16:17.942+00', NULL);
INSERT INTO public.users VALUES ('01a0e904-731d-72a3-9839-2d49a3f0e8e2', 'John', 'Lennon', 'band.setlist.song.list.1790615778021.k3d6kq8wj09@example.com', '11912345678', '$2b$10$k.xVDqUnOMEsU2wF0kkF/eJpKhLXuFW5vSon3CkP8J.ASS2hnbCcu', NULL, '2026-09-28 17:16:18.077+00', '2026-09-28 17:16:18.077+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0ae2-72a8-8acb-89755a38e14b', 'John', 'Lennon', 'band.setlist.song.list.1790615882371.vylvrwo7lvi@example.com', '11912345678', '$2b$10$8sbO1K50CveudU8k9vk8KuWsJ6sVuJlVwsg69n5Kcm/dtcidk/Mbe', NULL, '2026-09-28 17:18:02.466+00', '2026-09-28 17:18:02.466+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0bd6-7a81-a98c-d3ad037b0a08', 'John', 'Lennon', 'band.setlist.song.list.1790615882651.i89sgxvsbxr@example.com', '11912345678', '$2b$10$eqoglsTJpMd6rjlKYDpmTu0vP6DeDEOzeLMkw9c5LN195PenJ9uaW', NULL, '2026-09-28 17:18:02.71+00', '2026-09-28 17:18:02.71+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0c89-7e63-9908-f02522918a4a', 'John', 'Lennon', 'band.setlist.song.list.1790615882834.y7l6bqdd4ba@example.com', '11912345678', '$2b$10$mCpefR1yuqtwd9kDtRx8zO6Po/vaB6RdqOrMaUHyb5t9F0NkzcWLC', NULL, '2026-09-28 17:18:02.89+00', '2026-09-28 17:18:02.89+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0d19-7a36-9e0e-bd6e5275422a', 'John', 'Lennon', 'band.setlist.song.list.1790615882977.k4y1az0zq6@example.com', '11912345678', '$2b$10$PjTloPUuSj6kNJl3wobtc.3PZOqDWgmVY8oVQoWgq.cil5vpF1FbG', NULL, '2026-09-28 17:18:03.033+00', '2026-09-28 17:18:03.033+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0da2-7a98-aa05-beaec7930368', 'John', 'Lennon', 'band.setlist.song.list.1790615883115.ml0x79lgrr@example.com', '11912345678', '$2b$10$osSZPVake3X1vglvae8eQuKCTS.bUNoI6CbvivQL21HLOupp2fCeK', NULL, '2026-09-28 17:18:03.17+00', '2026-09-28 17:18:03.17+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0e9e-7b62-88be-8be85846f0c3', 'John', 'Lennon', 'band.setlist.song.list.1790615883369.c7jzz6dg6o@example.com', '11912345678', '$2b$10$KTp568xwFLYmBhLoSjTBp.T2jhL4Drsv520qpfyrJXKBc8e3iwWyC', NULL, '2026-09-28 17:18:03.422+00', '2026-09-28 17:18:03.422+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0f24-7589-aae8-f0e7699a1130', 'John', 'Lennon', 'band.setlist.song.list.1790615883500.0882ob9080rc@example.com', '11912345678', '$2b$10$78n70H.GWjRJzlkIUYFVw.RpODC5M0rMR/vg2zDC4m9snKT9vxiJW', NULL, '2026-09-28 17:18:03.556+00', '2026-09-28 17:18:03.556+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-0f9c-743a-ae27-3e165e58efd9', 'John', 'Lennon', 'band.setlist.song.list.1790615883623.cjbsoxtti2n@example.com', '11912345678', '$2b$10$7GZQuVi8XnUQ5lGDWXId.OpLHzl.jotLcYagJeMAT5ydpzd2Oc.KW', NULL, '2026-09-28 17:18:03.676+00', '2026-09-28 17:18:03.676+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-1023-7452-9e75-320a15f18e9c', 'John', 'Lennon', 'band.setlist.song.list.1790615883758.ovxs8ktxabq@example.com', '11912345678', '$2b$10$EFH0S2XPLbAUO86Z.v4AQO2aDySQo8trpGkxkxwvEGLOmZjGoIe1S', NULL, '2026-09-28 17:18:03.812+00', '2026-09-28 17:18:03.812+00', NULL);
INSERT INTO public.users VALUES ('01a0e906-10a6-7e3f-a5c2-375a3c2265ef', 'John', 'Lennon', 'band.setlist.song.list.1790615883889.fvpkwcq7kxo@example.com', '11912345678', '$2b$10$xpZsCMG5XlK4a3/TZdXe5.JaJVoG5w2gPQyn6WiBe8cqeZJ4ny4Pu', NULL, '2026-09-28 17:18:03.942+00', '2026-09-28 17:18:03.942+00', NULL);


--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 215
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: band_tools
--

SELECT pg_catalog.setval('public.migrations_id_seq', 9, true);


--
-- TOC entry 3373 (class 2606 OID 16611)
-- Name: band_setlist_songs PK_057daf4e0feaa52a77dbb403afd; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlist_songs
    ADD CONSTRAINT "PK_057daf4e0feaa52a77dbb403afd" PRIMARY KEY (id);


--
-- TOC entry 3367 (class 2606 OID 16583)
-- Name: band_songs PK_16d33bd3eb2690a651d5333cf01; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_songs
    ADD CONSTRAINT "PK_16d33bd3eb2690a651d5333cf01" PRIMARY KEY (id);


--
-- TOC entry 3355 (class 2606 OID 16533)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3357 (class 2606 OID 16544)
-- Name: bands PK_9355783ed6ad7f73a4d6fe50ea1; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT "PK_9355783ed6ad7f73a4d6fe50ea1" PRIMARY KEY (id);


--
-- TOC entry 3359 (class 2606 OID 16553)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 3380 (class 2606 OID 16647)
-- Name: user_contacts PK_c7048d25b5fda1fa70501fac9ca; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT "PK_c7048d25b5fda1fa70501fac9ca" PRIMARY KEY (id);


--
-- TOC entry 3377 (class 2606 OID 16632)
-- Name: band_bookings PK_c9087b7ed1a6b26f0278bffa11f; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_bookings
    ADD CONSTRAINT "PK_c9087b7ed1a6b26f0278bffa11f" PRIMARY KEY (id);


--
-- TOC entry 3364 (class 2606 OID 16563)
-- Name: band_members PK_e825dc62aa9ce798cc5a9e0cf6e; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_members
    ADD CONSTRAINT "PK_e825dc62aa9ce798cc5a9e0cf6e" PRIMARY KEY (band_id, user_id);


--
-- TOC entry 3370 (class 2606 OID 16598)
-- Name: band_setlists PK_f5ef8edb8f5427302f26c08ea3a; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlists
    ADD CONSTRAINT "PK_f5ef8edb8f5427302f26c08ea3a" PRIMARY KEY (id);


--
-- TOC entry 3361 (class 2606 OID 16555)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 3374 (class 1259 OID 16638)
-- Name: IDX_band_bookings_band_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_bookings_band_id" ON public.band_bookings USING btree (band_id);


--
-- TOC entry 3375 (class 1259 OID 16654)
-- Name: IDX_band_bookings_contact_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_bookings_contact_id" ON public.band_bookings USING btree (contact_id);


--
-- TOC entry 3362 (class 1259 OID 16574)
-- Name: IDX_band_members_user_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_members_user_id" ON public.band_members USING btree (user_id);


--
-- TOC entry 3371 (class 1259 OID 16622)
-- Name: IDX_band_setlist_songs_band_setlist_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_setlist_songs_band_setlist_id" ON public.band_setlist_songs USING btree (band_setlist_id);


--
-- TOC entry 3368 (class 1259 OID 16604)
-- Name: IDX_band_setlists_band_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_setlists_band_id" ON public.band_setlists USING btree (band_id);


--
-- TOC entry 3365 (class 1259 OID 16589)
-- Name: IDX_band_songs_band_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_songs_band_id" ON public.band_songs USING btree (band_id);


--
-- TOC entry 3378 (class 1259 OID 16653)
-- Name: IDX_user_contacts_user_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_user_contacts_user_id" ON public.user_contacts USING btree (user_id);


--
-- TOC entry 3384 (class 2606 OID 16599)
-- Name: band_setlists FK_2743ec366c465ce5924fd8b4c18; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlists
    ADD CONSTRAINT "FK_2743ec366c465ce5924fd8b4c18" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- TOC entry 3383 (class 2606 OID 16584)
-- Name: band_songs FK_33d198222d4286369d8290ae4de; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_songs
    ADD CONSTRAINT "FK_33d198222d4286369d8290ae4de" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- TOC entry 3387 (class 2606 OID 16633)
-- Name: band_bookings FK_6c98b6ca9cb8c3f44c94f7f9ad5; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_bookings
    ADD CONSTRAINT "FK_6c98b6ca9cb8c3f44c94f7f9ad5" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- TOC entry 3385 (class 2606 OID 16617)
-- Name: band_setlist_songs FK_71ee595088904ad13870acfd6f6; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlist_songs
    ADD CONSTRAINT "FK_71ee595088904ad13870acfd6f6" FOREIGN KEY (band_song_id) REFERENCES public.band_songs(id) ON DELETE CASCADE;


--
-- TOC entry 3381 (class 2606 OID 16569)
-- Name: band_members FK_76323f3340f50cef8abadae5ad3; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_members
    ADD CONSTRAINT "FK_76323f3340f50cef8abadae5ad3" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3386 (class 2606 OID 16612)
-- Name: band_setlist_songs FK_789c4ba2fa81c05fa267f300c47; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlist_songs
    ADD CONSTRAINT "FK_789c4ba2fa81c05fa267f300c47" FOREIGN KEY (band_setlist_id) REFERENCES public.band_setlists(id) ON DELETE CASCADE;


--
-- TOC entry 3382 (class 2606 OID 16564)
-- Name: band_members FK_81b938e7acde458606288b2074c; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_members
    ADD CONSTRAINT "FK_81b938e7acde458606288b2074c" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- TOC entry 3389 (class 2606 OID 16648)
-- Name: user_contacts FK_a81491e712124db8d5423803ecb; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT "FK_a81491e712124db8d5423803ecb" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3388 (class 2606 OID 16655)
-- Name: band_bookings FK_band_bookings_contact_id; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_bookings
    ADD CONSTRAINT "FK_band_bookings_contact_id" FOREIGN KEY (contact_id) REFERENCES public.user_contacts(id) ON DELETE RESTRICT;


-- Completed on 2026-09-28 16:35:24

--
-- PostgreSQL database dump complete
--

