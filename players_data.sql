--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

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
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (1, 'Alonso Bur├│n', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (2, 'Luis C├írdenas', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (3, 'Leonardo Gonzalez', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (4, 'Leonardo Lagos', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (5, 'Mat├¡as Soto', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (6, 'Claudio Sanz', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (7, 'Camilo Aranda', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (8, 'Marcos Waltemath', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (9, 'Ignacio Pereira', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (10, 'Felipe Avil├®s', 500, true, 19);
INSERT INTO public.players (id, name, starting_elo, active, division_id) VALUES (11, 'Lucas Waltemath', 500, true, 19);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.players_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

