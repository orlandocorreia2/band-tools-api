--
-- PostgreSQL database dump
--

\restrict L7lYNfyowKIMEsf9MJ5wST9oLRYAABURoWHaSaKfWveCY5fVxsfpVdrTQumFA4F

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.band_bookings DROP CONSTRAINT IF EXISTS "FK_band_bookings_contact_id";
ALTER TABLE IF EXISTS ONLY public.user_contacts DROP CONSTRAINT IF EXISTS "FK_a81491e712124db8d5423803ecb";
ALTER TABLE IF EXISTS ONLY public.band_members DROP CONSTRAINT IF EXISTS "FK_81b938e7acde458606288b2074c";
ALTER TABLE IF EXISTS ONLY public.band_setlist_songs DROP CONSTRAINT IF EXISTS "FK_789c4ba2fa81c05fa267f300c47";
ALTER TABLE IF EXISTS ONLY public.band_members DROP CONSTRAINT IF EXISTS "FK_76323f3340f50cef8abadae5ad3";
ALTER TABLE IF EXISTS ONLY public.band_setlist_songs DROP CONSTRAINT IF EXISTS "FK_71ee595088904ad13870acfd6f6";
ALTER TABLE IF EXISTS ONLY public.band_bookings DROP CONSTRAINT IF EXISTS "FK_6c98b6ca9cb8c3f44c94f7f9ad5";
ALTER TABLE IF EXISTS ONLY public.band_songs DROP CONSTRAINT IF EXISTS "FK_33d198222d4286369d8290ae4de";
ALTER TABLE IF EXISTS ONLY public.band_setlists DROP CONSTRAINT IF EXISTS "FK_2743ec366c465ce5924fd8b4c18";
DROP INDEX IF EXISTS public."IDX_user_contacts_user_id";
DROP INDEX IF EXISTS public."IDX_band_songs_band_id";
DROP INDEX IF EXISTS public."IDX_band_setlists_band_id";
DROP INDEX IF EXISTS public."IDX_band_setlist_songs_band_setlist_id";
DROP INDEX IF EXISTS public."IDX_band_members_user_id";
DROP INDEX IF EXISTS public."IDX_band_bookings_contact_id";
DROP INDEX IF EXISTS public."IDX_band_bookings_band_id";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3";
ALTER TABLE IF EXISTS ONLY public.band_setlists DROP CONSTRAINT IF EXISTS "PK_f5ef8edb8f5427302f26c08ea3a";
ALTER TABLE IF EXISTS ONLY public.band_members DROP CONSTRAINT IF EXISTS "PK_e825dc62aa9ce798cc5a9e0cf6e";
ALTER TABLE IF EXISTS ONLY public.band_bookings DROP CONSTRAINT IF EXISTS "PK_c9087b7ed1a6b26f0278bffa11f";
ALTER TABLE IF EXISTS ONLY public.user_contacts DROP CONSTRAINT IF EXISTS "PK_c7048d25b5fda1fa70501fac9ca";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE IF EXISTS ONLY public.bands DROP CONSTRAINT IF EXISTS "PK_9355783ed6ad7f73a4d6fe50ea1";
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS "PK_8c82d7f526340ab734260ea46be";
ALTER TABLE IF EXISTS ONLY public.band_songs DROP CONSTRAINT IF EXISTS "PK_16d33bd3eb2690a651d5333cf01";
ALTER TABLE IF EXISTS ONLY public.band_setlist_songs DROP CONSTRAINT IF EXISTS "PK_057daf4e0feaa52a77dbb403afd";
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_contacts;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP TABLE IF EXISTS public.bands;
DROP TABLE IF EXISTS public.band_songs;
DROP TABLE IF EXISTS public.band_setlists;
DROP TABLE IF EXISTS public.band_setlist_songs;
DROP TABLE IF EXISTS public.band_members;
DROP TABLE IF EXISTS public.band_bookings;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: band_tools
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO band_tools;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: band_tools
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
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
-- Name: migrations; Type: TABLE; Schema: public; Owner: band_tools
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO band_tools;

--
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
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: band_tools
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
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
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: band_bookings; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.band_bookings (id, band_id, title, date, start_time, duration, fee, status, consumption, link, note, created_at, updated_at, contact_id) FROM stdin;
\.


--
-- Data for Name: band_members; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.band_members (band_id, user_id, is_owner, created_at, updated_at) FROM stdin;
01a088e3-8eff-75f0-946e-2b9266c722a0	01a088df-1545-74c4-9266-c5c33942e835	t	2026-09-10 01:16:49.796+00	2026-09-10 01:16:49.796+00
01a0e8d0-9a74-79da-a631-dccf18393a1d	01a088df-1545-74c4-9266-c5c33942e835	t	2026-09-28 16:19:40.282+00	2026-09-28 16:19:40.282+00
\.


--
-- Data for Name: band_setlist_songs; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.band_setlist_songs (id, band_setlist_id, band_song_id, "position", created_at, updated_at) FROM stdin;
01a088fe-8dcd-79e9-b5b8-686a943d36de	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088ea-d60f-74bc-be07-a4f458bb1749	1	2026-09-10 01:46:18.957+00	2026-09-10 01:46:18.957+00
01a088fe-9277-774c-bb7d-20e3c478aa40	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088ee-d793-7cc1-97aa-7521d712c6ba	2	2026-09-10 01:46:20.151+00	2026-09-10 01:46:20.151+00
01a088fe-95b7-726e-ae3a-fca11a99600c	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f0-0755-79a2-976b-4cd47d9c50db	3	2026-09-10 01:46:20.983+00	2026-09-10 01:46:20.983+00
01a088fe-9a36-7b53-b4f2-4e25b04b820f	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f1-41c9-7a59-bfee-512b45424851	4	2026-09-10 01:46:22.134+00	2026-09-10 01:46:22.134+00
01a088fe-9d35-74ac-adf9-91afe0394017	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f2-d747-79fe-860b-47a505eb7cb1	5	2026-09-10 01:46:22.901+00	2026-09-10 01:46:22.901+00
01a088fe-a06a-755d-9f5a-0f6ecdbb540d	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f3-ef13-7af0-989a-760dbf620abc	6	2026-09-10 01:46:23.722+00	2026-09-10 01:46:23.722+00
01a088fe-a6e9-7abf-8ec1-70d03dfedc04	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f5-8ce5-78ac-afc1-75ce3759c005	7	2026-09-10 01:46:25.385+00	2026-09-10 01:46:25.385+00
01a088fe-aa2b-7947-8d3d-164ce431ac6c	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f7-3611-7e7b-a92d-8b633c408f05	8	2026-09-10 01:46:26.219+00	2026-09-10 01:46:26.219+00
01a088fe-bd15-77cb-95d9-b6ea5ad39445	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f8-0dcb-7b29-a772-5884b834abd5	9	2026-09-10 01:46:31.061+00	2026-09-10 01:46:31.061+00
01a088fe-c0fd-79e4-8af0-05052551bcea	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f8-adb5-7fec-9925-ca2df41ee968	10	2026-09-10 01:46:32.061+00	2026-09-10 01:46:32.061+00
01a088fe-c73f-7401-9735-9fe08f605714	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088f9-8660-7f27-8fb4-904a44b55dcb	11	2026-09-10 01:46:33.663+00	2026-09-10 01:46:33.663+00
01a088fe-caa7-72e3-9587-f8d12ad1a62a	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088fa-b586-7785-a236-99519f06ed01	12	2026-09-10 01:46:34.535+00	2026-09-10 01:46:34.535+00
01a088fe-cdf8-74de-82ff-dffec0e486c4	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088fc-112f-7bcd-aceb-f3d14a48a0f1	13	2026-09-10 01:46:35.384+00	2026-09-10 01:46:35.384+00
01a088fe-d3e7-747a-8224-de54e4036f63	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088fc-9cb2-7331-9cf6-63b03205784e	14	2026-09-10 01:46:36.903+00	2026-09-10 01:46:36.903+00
01a088fe-d726-7607-b100-1a77c77034c2	01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088fd-55e1-7bcc-908d-e57440cb34e3	15	2026-09-10 01:46:37.734+00	2026-09-10 01:46:37.734+00
01a0e8ec-77de-7677-9a67-7c2a19ee37d6	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8d7-7fdb-71b5-b006-7c6f1755dee7	1	2026-09-28 16:50:06.43+00	2026-09-28 16:50:06.43+00
01a0e8ec-cd87-7e08-ab54-0e36895f6b78	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8da-8091-7c95-b4bb-b7d13f23483e	2	2026-09-28 16:50:28.359+00	2026-09-28 16:50:28.359+00
01a0e8ec-7e4e-771e-bdf1-fc7eae02cf97	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8db-f280-77f6-ba3f-c1af9ab6b5f5	3	2026-09-28 16:50:08.078+00	2026-09-28 16:50:08.078+00
01a0e8ec-810e-745c-bac6-2d8079b9b58f	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8de-47dd-7070-8f79-95be9e4a443f	4	2026-09-28 16:50:08.782+00	2026-09-28 16:50:08.782+00
01a0e8ec-849e-7c51-b139-21b2c01a2c7d	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8e1-19e9-7364-9e0f-2362668225fe	5	2026-09-28 16:50:09.694+00	2026-09-28 16:50:09.694+00
01a0e8ec-8762-7bfc-85f4-b6b022b02187	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8e2-792c-783c-a9c7-a5dcfbb9a556	6	2026-09-28 16:50:10.402+00	2026-09-28 16:50:10.402+00
01a0e8ec-89d6-7b71-ab6f-8e19baf5457d	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8e4-437c-7618-b2a5-437f16eaf893	7	2026-09-28 16:50:11.03+00	2026-09-28 16:50:11.03+00
01a0e8ec-906b-784e-95e5-8593bfa509c2	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8e6-9c61-7a64-a6e2-72da048ad3a9	8	2026-09-28 16:50:12.715+00	2026-09-28 16:50:12.715+00
01a0e8ec-95f0-7b42-8694-e00ff4765939	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8e8-631a-713b-9bfd-426cf42698a0	9	2026-09-28 16:50:14.128+00	2026-09-28 16:50:14.128+00
01a0e8ec-9840-75ef-9157-0e097fb914f9	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8e9-9f3a-7f82-8ca2-059166256f6a	10	2026-09-28 16:50:14.72+00	2026-09-28 16:50:14.72+00
01a0e8ec-9c93-72f4-b49e-e4f6dd618c21	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8eb-00d1-79b1-89ae-86d3640bfab7	11	2026-09-28 16:50:15.827+00	2026-09-28 16:50:15.827+00
01a0e8ec-9f47-7b4a-b571-6e5330ce8b70	01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8ec-2844-73e3-b4fc-2b3996fd4a98	12	2026-09-28 16:50:16.519+00	2026-09-28 16:50:16.519+00
\.


--
-- Data for Name: band_setlists; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.band_setlists (id, band_id, name, created_at, updated_at) FROM stdin;
01a088fe-58c8-7577-90f5-a5cdc99f82d5	01a088e3-8eff-75f0-946e-2b9266c722a0	Show dia 07 Novembro	2026-09-10 01:46:05.384+00	2026-09-10 01:46:05.384+00
01a0e8d2-0986-7c53-b121-a780908a6144	01a0e8d0-9a74-79da-a631-dccf18393a1d	Knights Pub	2026-09-28 16:21:14.246+00	2026-09-28 16:21:14.246+00
\.


--
-- Data for Name: band_songs; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.band_songs (id, band_id, title, tuning, tonality, bpm, duration, lyrics, notes, created_at, updated_at) FROM stdin;
01a088f1-41c9-7a59-bfee-512b45424851	01a088e3-8eff-75f0-946e-2b9266c722a0	I	Eb-Ab-Db-Gb-Bb-Eb	Ebm	94	313	\N	\N	2026-09-10 01:31:47.529+00	2026-09-10 01:31:47.529+00
01a088f2-d747-79fe-860b-47a505eb7cb1	01a088e3-8eff-75f0-946e-2b9266c722a0	Heaven and Hell	Eb-Ab-Db-Gb-Bb-Eb	Ebm	89	360	\N	\N	2026-09-10 01:33:31.335+00	2026-09-10 01:33:31.335+00
01a088f3-ef13-7af0-989a-760dbf620abc	01a088e3-8eff-75f0-946e-2b9266c722a0	Children of the Sea	Eb-Ab-Db-Gb-Bb-Eb	Abm	71	333	\N	\N	2026-09-10 01:34:42.963+00	2026-09-10 01:34:42.963+00
01a088f5-8ce5-78ac-afc1-75ce3759c005	01a088e3-8eff-75f0-946e-2b9266c722a0	Stargazer	E-A-D-G-B-E	Em	88	506	\N	\N	2026-09-10 01:36:28.901+00	2026-09-10 01:36:28.901+00
01a088f7-3611-7e7b-a92d-8b633c408f05	01a088e3-8eff-75f0-946e-2b9266c722a0	Die Young	Eb-Ab-Db-Gb-Bb-Eb	Ebm	200	283	\N	\N	2026-09-10 01:38:17.745+00	2026-09-10 01:38:17.745+00
01a088f8-0dcb-7b29-a772-5884b834abd5	01a088e3-8eff-75f0-946e-2b9266c722a0	Don't Talk to Strangers	E-A-D-G-B-E	Dm	132	293	\N	\N	2026-09-10 01:39:12.971+00	2026-09-10 01:39:12.971+00
01a088f8-adb5-7fec-9925-ca2df41ee968	01a088e3-8eff-75f0-946e-2b9266c722a0	Long Live Rock N' Roll	E-A-D-G-B-E	Gm	143	261	\N	\N	2026-09-10 01:39:53.909+00	2026-09-10 01:39:53.909+00
01a088f9-8660-7f27-8fb4-904a44b55dcb	01a088e3-8eff-75f0-946e-2b9266c722a0	We Rock	E-A-D-G-B-E	Am	154	273	\N	\N	2026-09-10 01:40:49.376+00	2026-09-10 01:40:49.376+00
01a088fa-b586-7785-a236-99519f06ed01	01a088e3-8eff-75f0-946e-2b9266c722a0	Kill the King	E-A-D-G-B-E	Gm	239	267	\N	\N	2026-09-10 01:42:06.982+00	2026-09-10 01:42:06.982+00
01a088fc-112f-7bcd-aceb-f3d14a48a0f1	01a088e3-8eff-75f0-946e-2b9266c722a0	The Mob Rules	Eb-Ab-Db-Gb-Bb-Eb	Abm	144	192	\N	\N	2026-09-10 01:43:35.983+00	2026-09-10 01:43:35.983+00
01a088fc-9cb2-7331-9cf6-63b03205784e	01a088e3-8eff-75f0-946e-2b9266c722a0	Killing the Dragon	E-A-D-G-B-E	Gm	141	265	\N	\N	2026-09-10 01:44:11.698+00	2026-09-10 01:44:11.698+00
01a088fd-55e1-7bcc-908d-e57440cb34e3	01a088e3-8eff-75f0-946e-2b9266c722a0	Neon Knights	Eb-Ab-Db-Gb-Bb-Eb	Eb	192	231	\N	\N	2026-09-10 01:44:59.105+00	2026-09-10 01:44:59.105+00
01a088ea-d60f-74bc-be07-a4f458bb1749	01a088e3-8eff-75f0-946e-2b9266c722a0	The Last in Line	E-A-D-G-B-E	Am	86	340	\N	\N	2026-09-10 01:24:46.735+00	2026-09-10 01:24:46.735+00
01a088ee-d793-7cc1-97aa-7521d712c6ba	01a088e3-8eff-75f0-946e-2b9266c722a0	Holy Diver	E-A-D-G-B-E	Cm	93	366	\N	\N	2026-09-10 01:29:09.267+00	2026-09-10 01:29:09.267+00
01a088f0-0755-79a2-976b-4cd47d9c50db	01a088e3-8eff-75f0-946e-2b9266c722a0	Rainbow In the Dark	E-A-D-G-B-E	Am	118	253	\N	\N	2026-09-10 01:30:27.029+00	2026-09-10 01:30:27.029+00
01a0e8d7-7fdb-71b5-b006-7c6f1755dee7	01a0e8d0-9a74-79da-a631-dccf18393a1d	Children of the Grave	C#	C#m	146	318	\N	\N	2026-09-28 16:27:12.219+00	2026-09-28 16:27:12.219+00
01a0e8da-8091-7c95-b4bb-b7d13f23483e	01a0e8d0-9a74-79da-a631-dccf18393a1d	Cornucopia	C#	C#m	142	234	\N	\N	2026-09-28 16:30:29.009+00	2026-09-28 16:30:29.009+00
01a0e8db-f280-77f6-ba3f-c1af9ab6b5f5	01a0e8d0-9a74-79da-a631-dccf18393a1d	Killing Yourself to Live	C#	C#m	125	341	\N	\N	2026-09-28 16:32:03.712+00	2026-09-28 16:32:03.712+00
01a0e8de-47dd-7070-8f79-95be9e4a443f	01a0e8d0-9a74-79da-a631-dccf18393a1d	Sabbath Bloody Sabbath	C#	C#m	133	345	\N	\N	2026-09-28 16:34:36.637+00	2026-09-28 16:34:36.637+00
01a0e8e1-19e9-7364-9e0f-2362668225fe	01a0e8d0-9a74-79da-a631-dccf18393a1d	Under the Sun	C#	C#m	130	352	\N	\N	2026-09-28 16:37:41.481+00	2026-09-28 16:37:41.481+00
01a0e8e2-792c-783c-a9c7-a5dcfbb9a556	01a0e8d0-9a74-79da-a631-dccf18393a1d	Snowblind	C#	C#m	115	333	\N	\N	2026-09-28 16:39:11.404+00	2026-09-28 16:39:11.404+00
01a0e8e4-437c-7618-b2a5-437f16eaf893	01a0e8d0-9a74-79da-a631-dccf18393a1d	Supernaut	C#	C#m	120	240	\N	\N	2026-09-28 16:41:08.732+00	2026-09-28 16:41:08.732+00
01a0e8e6-9c61-7a64-a6e2-72da048ad3a9	01a0e8d0-9a74-79da-a631-dccf18393a1d	Into the Void	C#	C#m	77	373	\N	\N	2026-09-28 16:43:42.561+00	2026-09-28 16:43:42.561+00
01a0e8e8-631a-713b-9bfd-426cf42698a0	01a0e8d0-9a74-79da-a631-dccf18393a1d	Hand of Doom	E	Em	136	427	\N	\N	2026-09-28 16:45:38.97+00	2026-09-28 16:45:38.97+00
01a0e8e9-9f3a-7f82-8ca2-059166256f6a	01a0e8d0-9a74-79da-a631-dccf18393a1d	Electric Funeral	E	Em	124	290	\N	\N	2026-09-28 16:46:59.898+00	2026-09-28 16:46:59.898+00
01a0e8eb-00d1-79b1-89ae-86d3640bfab7	01a0e8d0-9a74-79da-a631-dccf18393a1d	Fairies Wear Boots	E	Gm	136	375	\N	\N	2026-09-28 16:48:30.417+00	2026-09-28 16:48:30.417+00
01a0e8ec-2844-73e3-b4fc-2b3996fd4a98	01a0e8d0-9a74-79da-a631-dccf18393a1d	Black Sabbath	E	Gm	66	378	\N	\N	2026-09-28 16:49:46.052+00	2026-09-28 16:49:46.052+00
\.


--
-- Data for Name: bands; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.bands (id, name, genre, description, state, city, neighborhood, address, status, image, started_at, created_at, updated_at, deleted_at) FROM stdin;
01a088e3-8eff-75f0-946e-2b9266c722a0	Dio Experience	Heavy Metal	Banda tributo ao Ronie James Dio	São Paulo	São Paulo	Jardim Ibirapuera	Rua Solar dos Quevedos, 06	Active	\N	2026-08-01	2026-09-10 01:16:49.791+00	2026-09-10 01:16:49.791+00	\N
01a0e8d0-9a74-79da-a631-dccf18393a1d	Lendas do Som	Doom Metal	Banda tributo a Black Sabbath que toca as músicas lado B com Ozzy Osbourne	São Paulo	São Paulo	Centro	Centro	Active	\N	2026-05-17	2026-09-28 16:19:40.276+00	2026-09-28 16:19:40.276+00	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1780368748378	CreateBandsTable1780368748378
2	1782957405196	CreateUsersTable1782957405196
3	1784651680416	CreateBandMembersTable1784651680416
4	1784674324900	CreateBandSongsTable1784674324900
5	1785793468320	CreateBandSetlistsTable1785793468320
6	1785797863795	CreateBandSetlistSongsTable1785797863795
7	1786145039439	CreateBandBookingsTable1786145039439
8	1786580209116	CreateUserContactsTable1786580209116
9	1787285512757	LinkBandBookingContact1787285512757
\.


--
-- Data for Name: user_contacts; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.user_contacts (id, user_id, name, phone, alternate_phone, venue_name, address, email, role, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: band_tools
--

COPY public.users (id, first_name, last_name, email, phone, password, avatar, created_at, updated_at, deleted_at) FROM stdin;
01a088df-1545-74c4-9266-c5c33942e835	Orlando	Nascimento	ocnascimento2@gmail.com	11912345678	$2b$10$YTrrwBJ0k7sNEWX20MzqaehN8yZjg1biX7bPL0U.jtO5dHtBrkDYK	\N	2026-09-10 01:11:56.486+00	2026-09-10 01:11:56.486+00	\N
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: band_tools
--

SELECT pg_catalog.setval('public.migrations_id_seq', 9, true);


--
-- Name: band_setlist_songs PK_057daf4e0feaa52a77dbb403afd; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlist_songs
    ADD CONSTRAINT "PK_057daf4e0feaa52a77dbb403afd" PRIMARY KEY (id);


--
-- Name: band_songs PK_16d33bd3eb2690a651d5333cf01; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_songs
    ADD CONSTRAINT "PK_16d33bd3eb2690a651d5333cf01" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: bands PK_9355783ed6ad7f73a4d6fe50ea1; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT "PK_9355783ed6ad7f73a4d6fe50ea1" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: user_contacts PK_c7048d25b5fda1fa70501fac9ca; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT "PK_c7048d25b5fda1fa70501fac9ca" PRIMARY KEY (id);


--
-- Name: band_bookings PK_c9087b7ed1a6b26f0278bffa11f; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_bookings
    ADD CONSTRAINT "PK_c9087b7ed1a6b26f0278bffa11f" PRIMARY KEY (id);


--
-- Name: band_members PK_e825dc62aa9ce798cc5a9e0cf6e; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_members
    ADD CONSTRAINT "PK_e825dc62aa9ce798cc5a9e0cf6e" PRIMARY KEY (band_id, user_id);


--
-- Name: band_setlists PK_f5ef8edb8f5427302f26c08ea3a; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlists
    ADD CONSTRAINT "PK_f5ef8edb8f5427302f26c08ea3a" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: IDX_band_bookings_band_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_bookings_band_id" ON public.band_bookings USING btree (band_id);


--
-- Name: IDX_band_bookings_contact_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_bookings_contact_id" ON public.band_bookings USING btree (contact_id);


--
-- Name: IDX_band_members_user_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_members_user_id" ON public.band_members USING btree (user_id);


--
-- Name: IDX_band_setlist_songs_band_setlist_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_setlist_songs_band_setlist_id" ON public.band_setlist_songs USING btree (band_setlist_id);


--
-- Name: IDX_band_setlists_band_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_setlists_band_id" ON public.band_setlists USING btree (band_id);


--
-- Name: IDX_band_songs_band_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_band_songs_band_id" ON public.band_songs USING btree (band_id);


--
-- Name: IDX_user_contacts_user_id; Type: INDEX; Schema: public; Owner: band_tools
--

CREATE INDEX "IDX_user_contacts_user_id" ON public.user_contacts USING btree (user_id);


--
-- Name: band_setlists FK_2743ec366c465ce5924fd8b4c18; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlists
    ADD CONSTRAINT "FK_2743ec366c465ce5924fd8b4c18" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: band_songs FK_33d198222d4286369d8290ae4de; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_songs
    ADD CONSTRAINT "FK_33d198222d4286369d8290ae4de" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: band_bookings FK_6c98b6ca9cb8c3f44c94f7f9ad5; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_bookings
    ADD CONSTRAINT "FK_6c98b6ca9cb8c3f44c94f7f9ad5" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: band_setlist_songs FK_71ee595088904ad13870acfd6f6; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlist_songs
    ADD CONSTRAINT "FK_71ee595088904ad13870acfd6f6" FOREIGN KEY (band_song_id) REFERENCES public.band_songs(id) ON DELETE CASCADE;


--
-- Name: band_members FK_76323f3340f50cef8abadae5ad3; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_members
    ADD CONSTRAINT "FK_76323f3340f50cef8abadae5ad3" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: band_setlist_songs FK_789c4ba2fa81c05fa267f300c47; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_setlist_songs
    ADD CONSTRAINT "FK_789c4ba2fa81c05fa267f300c47" FOREIGN KEY (band_setlist_id) REFERENCES public.band_setlists(id) ON DELETE CASCADE;


--
-- Name: band_members FK_81b938e7acde458606288b2074c; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_members
    ADD CONSTRAINT "FK_81b938e7acde458606288b2074c" FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: user_contacts FK_a81491e712124db8d5423803ecb; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.user_contacts
    ADD CONSTRAINT "FK_a81491e712124db8d5423803ecb" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: band_bookings FK_band_bookings_contact_id; Type: FK CONSTRAINT; Schema: public; Owner: band_tools
--

ALTER TABLE ONLY public.band_bookings
    ADD CONSTRAINT "FK_band_bookings_contact_id" FOREIGN KEY (contact_id) REFERENCES public.user_contacts(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: band_tools
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict L7lYNfyowKIMEsf9MJ5wST9oLRYAABURoWHaSaKfWveCY5fVxsfpVdrTQumFA4F

