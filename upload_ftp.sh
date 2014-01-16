sudo apt-get install lftp wput

printf %s $(date --date="4 hours ago" +%b_%d_%Y@%H_%M_%S) > /tmp/date.txt
zip -r /tmp/xively-iostp-$(cat /tmp/date.txt).zip app
wput /tmp/xively-iostp-$(cat /tmp/date.txt).zip ftp://vagrant:vagrant@10.100.0.78/xively-daily-builds/xively-iostp-$(cat /tmp/date.txt).zip

HOST="10.100.0.78"
USER="vagrant"
PASS="vagrant"
FTPURL="ftp://$USER:$PASS@$HOST"
LCD="app"
RCD="/www"
DELETE="--delete"
time lftp -c "set ftp:list-options -a;
open '$FTPURL';
lcd $LCD;
cd $RCD;
mirror --reverse \
       $DELETE \
       --verbose"