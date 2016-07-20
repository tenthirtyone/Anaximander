#Hours for a file
cut -d',' -f1 Anaximander-raw-data-may14.csv | cut -d' ' -f2 | cut -d':' -f1 | sort | uniq -c
