\encoding UTF8
\COPY (SELECT * FROM players ORDER BY id) TO 'C:/tmp/players.csv' WITH (FORMAT CSV, HEADER);
\COPY (SELECT * FROM games ORDER BY id) TO 'C:/tmp/games.csv' WITH (FORMAT CSV, HEADER);
