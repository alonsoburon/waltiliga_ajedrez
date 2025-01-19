\encoding UTF8
\COPY players FROM 'C:/tmp/players.csv' WITH (FORMAT CSV, HEADER);
\COPY games FROM 'C:/tmp/games.csv' WITH (FORMAT CSV, HEADER);
