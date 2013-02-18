cd moscow_stops;
ant default;
cd ..;
../bin/pserve development.ini --stop;
../bin/pserve development.ini --daemon;