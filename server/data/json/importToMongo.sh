#!/bin/bash

# After this is run change the data type for the timestamps
# db.trips.find ( { dropoffTime: {$type: 2}}).forEach( function(x) { x.dropoffTime = new Date(x.dropoffTime); db.trips.save(x); })

echo '#### Beginning ####'

for i in `ls | grep json`; do
	echo '########'
	echo '########'
	echo
	echo 'Working File: ' $i
	echo
	echo '########'
	echo '########'
	
	mongoimport --db Anaximander --collection trips --file $i --jsonArray
done

