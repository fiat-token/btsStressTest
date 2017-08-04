#btcStressTest
Scripts for stressing the bitcoin core with multiple transactions

HOWTO (NODE.JS):

install node.js and npm (on ubuntu)run:

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get install -y nodejs

or:
chmod +x nodejsInstaller.sh

./nodejsInstaller.sh

HOWTO (FOREVER):

In order to run application permanently, install forever:

sudo npm install forever -g

To check running process 

forever list

COMMANDS:

#CONTINOUS TEST
waitSec=3600 elaborateThreshold=0.000001 maxTXs=100 quantity=1 forever immortal.js

#BULK TEST

#Edit crontab file
crontab -e

#Add a new line (Run every night once at hour from 2 a.m. to 4 a.m. [AWS machine local time - in Italy from 0 a.m. to 2 a.m.] and send 10K txs)
0 2-4 * * * (bcreg="/usr/local/bin/bitcoin-cli" elaborateThreshold=0.00001 fee=0.00001 maxTXs=20 quantity=500 node /home/ubuntu/btsStressTest/maker.js && bcreg="/usr/local/bin/bitcoin-cli" elaborateThreshold=0.000001 fee=0.0000001 maxTXs=10000 quantity=1 node /home/ubuntu/btsStressTest/maker.js) > /home/ubuntu/btsStressTest/bulkStressTest.log
