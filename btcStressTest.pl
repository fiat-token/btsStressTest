use 5.022;
use warnings;

#commands
my $bcreg = $ARGV[0] // "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
my $addresses = $ARGV[1] // 1000;
my $amount = $ARGV[2] // 0.0499;
my $fee = $ARGV[3] // 0.0001;
my $money = $amount - $fee;
say "Executing script\naddresses=$addresses\namount=$amount\nfee=$fee\nmoney=$money";

#data
my @listAddress;
my $stringOutput;
chomp(my $utxo_txid = `$bcreg listunspent | jq -r '.[0] | .txid'`);
chomp(my $utxo_vout= `$bcreg listunspent | jq -r '.[0] | .vout'`);

#functions
sub milleAddress()
{
        for (1 .. $addresses)
        {
                chomp(my $address = `$bcreg getnewaddress`);
                push @listAddress, $address;
        }
}

#creo mille address
say "creazione mille address";
milleAddress();

$stringOutput = "\"" .  (join "\": $amount, \"", @listAddress) . "\": $amount";

#say "string output:";
#say $stringOutput;
my $cmd = "$bcreg -named createrawtransaction inputs='''[ { \"txid\": \"$utxo_txid\", \"vout\": $utxo_vout } ]''' outputs='''{$stringOutput}'''";
chomp(my $rawtxhex = `$cmd 2>&1`);


my $cmdSignTx = "$bcreg -named signrawtransaction hexstring=$rawtxhex | jq -r '.hex'";
chomp(my $signedtx = `$cmdSignTx 2>&1`);


my $cmdSendTX = "$bcreg -named sendrawtransaction hexstring=$signedtx";
chomp(my $hashTx = `$cmdSendTX 2>&1`);

#inizio seconda parte
my $cmdMining = "$bcreg generate 1";
my @allTx;
say "inizio creazione e firma delle tx";
for my $index(0 .. @listAddress)
{
        say $index if($index % 20 == 0);
        my $cmd1 = "$bcreg listunspent | jq -r '.[$index] | .txid'";
        chomp(my $utxo_txid0 = `$cmd1 2>&1`);

       my $cmd2 = "$bcreg listunspent | jq -r '.[$index] | .vout'";
        chomp(my $utxo_vout0 = `$cmd2 2>&1`);

       my $cmd3 = "$bcreg getrawchangeaddress";
        chomp(my $newrecipient0 = `$cmd3 2>&1`);


       my $cmd4 = "$bcreg -named createrawtransaction inputs='''[ { \"txid\": \"$utxo_txid0\", \"vout\": $utxo_vout0 } ]''' outputs='''{ \"$newrecipient0\": $money }'''";
        chomp(my $rawtxhex0 = `$cmd4 2>&1`);

       my $cmd5 = "$bcreg -named signrawtransaction hexstring=$rawtxhex0 | jq -r '.hex'";
        chomp(my $signedtx0 = `$cmd5 2>&1`);

       push @allTx, "$bcreg -named sendrawtransaction hexstring=$signedtx0";
}
say "fine creazione e firma delle tx";


my $startTime = time();
say "inizio esecuzione: " . localtime(time);


for my $tx (@allTx)
{
        chomp(my $res =  `$tx 2>&1`);
        say $res;
}

my $endTime = time();
say "tempo esecuzione: " . ($endTime - $startTime);
#END
