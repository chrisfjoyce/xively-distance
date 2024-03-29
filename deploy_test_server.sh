sudo apt-get install lftp wput

grunt clean
grunt --force

rm -rf /tmp/app
mkdir /tmp/app

cp -r app /tmp

cp .tmp/styles/main.css /tmp/app/styles

printf %s $(date --date="4 hours ago" +%b_%d_%Y@%H_%M_%S) > /tmp/date.txt

cd /tmp/app
zip -9 -r /tmp/xively-iostp-$(cat /tmp/date.txt).zip *

cp /tmp/xively-iostp-$(cat /tmp/date.txt).zip ~/xively-iostp-$(cat /tmp/date.txt).zip

ssh -i ~/xively-key.pem ec2-user@ec2-54-242-146-91.compute-1.amazonaws.com 'rm -rf ~/xively-iostp-www/*'
scp -i ~/xively-key.pem  /tmp/xively-iostp-$(cat /tmp/date.txt).zip  ec2-user@ec2-54-242-146-91.compute-1.amazonaws.com:~/xively-iostp-www
ssh -i ~/xively-key.pem ec2-user@ec2-54-242-146-91.compute-1.amazonaws.com 'cp ~/xively-iostp-www/*.zip ~/xively-iostp-daily-builds'
ssh -i ~/xively-key.pem ec2-user@ec2-54-242-146-91.compute-1.amazonaws.com 'unzip ~/xively-iostp-www/*.zip -d ~/xively-iostp-www'



# wput /tmp/xively-iostp-$(cat /tmp/date.txt).zip ftp://vagrant:vagrant@10.100.0.78/xively-daily-builds/xively-iostp-$(cat /tmp/date.txt).zip

# HOST="10.100.0.78"
# USER="vagrant"
# PASS="vagrant"
# FTPURL="ftp://$USER:$PASS@$HOST"
# LCD="/tmp/app"
# RCD="/www"
# DELETE="--delete"
# time lftp -c "set ftp:list-options -a;
# open '$FTPURL';
# lcd $LCD;
# cd $RCD;
# mirror --reverse \
#        $DELETE \
#        --verbose"