Stable version without RPC calls

#btcStressTest
Scripts for stressing the bitcoin core with multiple transactions

HOWTO (NODE.JS):

install node.js and npm (on ubuntu)run:

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get install -y nodejs

or:
chmod +x nodejsInstaller.sh

./nodejsInstaller.sh


COMMANDS:

#Edit crontab file
crontab -e

#Add the following new lines 

#ContinousStressTest
0 * * * * (bcreg="/usr/local/bin/bitcoin-cli" elaborateThreshold=0.000001 fee=0.0000001 maxTXs=10 quantity=5 node /home/ubuntu/btsStressTest/maker.js && sleep 10 && bcreg="/usr/local/bin/bitcoin-cli" elaborateThreshold=0.000001 fee=0.0000001 maxTXs=50 quantity=1 node /home/ubuntu/btsStressTest/maker.js) >> /home/ubuntu/btsStressTest/continousStressTest.log

#BulkStressTest
0 4-6 * * * (bcreg="/usr/local/bin/bitcoin-cli" elaborateThreshold=0.000001 fee=0.0000001 maxTXs=110 quantity=30 node /home/ubuntu/btsStressTest/maker.js && sleep 10 && bcreg="/usr/local/bin/bitcoin-cli" elaborateThreshold=0.000001 fee=0.0000001 maxTXs=3300 quantity=1 node /home/ubuntu/btsStressTest/maker.js) >> /home/ubuntu/btsStressTest/bulkStressTest.log

#CleanerStressTest
30 5 * * * (bcreg="/usr/local/bin/bitcoin-cli" cleanerThreshold=0.000001 fee=0.0000001 dimBlock=100 node /home/ubuntu/btsStressTest/cleaner.js)  >> /home/ubuntu/btsStressTest/cleanerStressTest.log
