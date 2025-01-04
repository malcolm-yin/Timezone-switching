DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
    geo_name_id INTEGER, -- integer id of record in geonames database
    name VARCHAR(200), -- name of geographical point (utf8)
    alternate_names VARCHAR(10000), -- alternatenames, comma separated
    latitude DECIMAL, -- latitude in decimal degrees (wgs84)
    longitude DECIMAL, -- longitude in decimal degrees (wgs84)
    country_code CHAR(2), -- ISO-3166 2-letter country code
    population BIGINT, -- population, bigint (8 byte int)
    timezone VARCHAR(40), -- the iana timezone id
    modification_date DATE -- date of last modification in yyyy-MM-dd format
);

-- \copy command cannot be executed from a script file directly
-- Remove the following \copy line if you are executing it as a standalone SQL script
\copy cities(geo_name_id, name, alternate_names, latitude, longitude, country_code, population, timezone, modification_date)
FROM '/Users/citu/Documents/Timezone/formatted_cities.csv'
WITH (FORMAT CSV, HEADER);
