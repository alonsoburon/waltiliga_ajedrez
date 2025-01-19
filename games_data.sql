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
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (37, 3, 5, 1, '2025-01-09 18:30:00', 1, 4, '1', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (38, 7, 1, 1, '2025-01-09 20:25:00', 1, 4, '1', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (43, 10, 2, 1, '2025-01-14 00:28:24.802', 1, 4, '4', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (44, 5, 7, 1, '2025-01-14 01:07:16.088', 1, 4, '4', true, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (45, 11, 7, 1, '2025-01-14 04:59:27.428', 1, 4, '4', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (48, 1, 5, 1, '2025-01-14 23:59:48.587', 1, 4, '4', true, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (39, 8, 2, -1, '2025-01-09 20:52:35', 1, 4, '1', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (40, 6, 10, -1, '2025-01-09 21:30:00', 1, 4, '1', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (41, 11, 8, -1, '2025-01-10 04:16:12.647', 1, 4, '1', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (42, 8, 11, -1, '2025-01-10 04:56:33.353', 1, 4, '1', true, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (46, 9, 3, -1, '2025-01-14 19:39:05.49', 1, 4, '4', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (47, 6, 5, -1, '2025-01-14 19:52:54.447', 1, 4, '4', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (49, 6, 7, -1, '2025-01-15 16:31:49.682216', 1, 4, '1', false, false, false, false, false);
INSERT INTO public.games (id, white_id, black_id, result, played_at, week, season_id, created_by, cond1, cond2, cond3, cond4, cond5) VALUES (50, 10, 1, -1, '2025-01-16 20:30:08.406313', 1, 4, '1', false, false, false, false, false);


--
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.games_id_seq', 50, true);


--
-- PostgreSQL database dump complete
--

