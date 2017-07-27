use 5.022;
use warnings;
use Getopt::Long;
use experimental 'signatures';
use Time::HiRes qw(gettimeofday);

Getopt::Long::Configure qw(gnu_getopt);

#default params
my $bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
my $addresses = 1000;
my $fee = 0.0001;
my $split = 1000;

#get params
GetOptions
(
        'bcreg|b=s'     => \$bcreg,
        'addresses|ad=s'        => \$addresses,       
        'fee|f=s'       => \$fee,       
        'split|s=s'       => \$split
) or die "err options!\n";

#output params
say "Executing script $0\n";
say "parameters:";
say "bcreg: $bcreg";
say "addresses: $addresses";
say "fee: $fee";
say "split: $split";

stamp("Executing script $0\n");
stamp("parameters:");
stamp("bcreg: $bcreg");
stamp("addresses: $addresses");
stamp("fee: $fee");
stamp("split: $split");

#variables
my @allListAddress;
my @arr;
my $res = $addresses / $split;
my $file = "stressTest.log";

for (1 .. $res)
{
	push @arr, $split;
}

stamp("Initialiting loop at: " . gettimeofday());
for my $loopAddress(0 .. $#arr)
{
	stamp("Cycle $loopAddress...");
	#calculating max utxo
	say "\t0: calculating max amount to select input utxo...";	
	my $amount = get("$bcreg listunspent | jq 'max_by(.amount) | .amount'");
	stamp("\tamount: $amount");
	say "\tamount: $amount";

	#creating addresses
	say "\t1: creating $arr[$loopAddress] addresses..";
	my @listAddress = createAddresses($arr[$loopAddress]);
	push @allListAddress, @listAddress;

	my $outamount = $amount / ($arr[$loopAddress]) - $fee;
	say "\tarray: $#arr";
	say "\tloopValue: $arr[$loopAddress]";
	say "\toutput amount: $outamount";
	stamp("\tarray: $#arr");
	stamp("\tloopValue: $arr[$loopAddress]");
	stamp("\toutput amount: $outamount");
	#creating string containing all the outputs..
	say "\t2: creating string containing all the outputs..";
	my $stringOutput = "\"" .  (join "\": $outamount, \"", @listAddress) . "\": $outamount";
	
	#get utxo_txid
	say "\t3: get the input utxo transaction id..";
	my $utxo_txid = get("$bcreg listunspent | jq 'max_by(.amount) | .txid'");
	say "\tutxo_txid: $utxo_txid";
	stamp("\tutxo_txid: $utxo_txid");

	#get utxo_vout
	say "\t4: get the input utxo vout..";
	my $utxo_vout = get("$bcreg listunspent | jq -r 'max_by(.amount) | .vout'");
	say "\tutxo_vout: $utxo_vout";
	stamp("\tutxo_vout: $utxo_vout");

	#bcreg createrawtransaction
	say "\t5: creating transaction with $arr[$loopAddress] outputs..";
	my $rawtxhex = get("$bcreg -named createrawtransaction inputs='''[ { \"txid\": $utxo_txid, \"vout\": $utxo_vout } ]''' outputs='''{$stringOutput}'''");
	say "\trawtxhex: $rawtxhex";
	stamp("\trawtxhex: $rawtxhex");

	#bcreg createrawtransaction
	say "\t6: signing transaction with $arr[$loopAddress] outputs..";
	my $signedtx = get("$bcreg -named signrawtransaction hexstring=$rawtxhex | jq -r '.hex'");

	#bcreg sendrawtransaction
	say "\t7: sending transaction with $arr[$loopAddress] outputs..";
	my $hashTx = get("$bcreg -named sendrawtransaction hexstring=$signedtx");
		
	#mining
	say "\t8: generating new block..";
	my $cmdMining = get("$bcreg generate 1");
	#say "\tcmdMining: $cmdMining";
}
stamp("End loop");

#inizio creazione e firma delle tx
stamp("9: starting creation and signing of $addresses transactions..");
say "9: starting creation and signing of $addresses transactions..";
my @allTx;
for my $index(0 .. @allListAddress)
{
        stamp("\t$index/" . scalar @allListAddress . "..") if($index % 100 == 0 || $index == scalar @allListAddress);

        my $utxo_txid0 = get("$bcreg listunspent | jq -r '.[$index] | .txid'");
        my $utxo_vout0 = get("$bcreg listunspent | jq -r '.[$index] | .vout'");
		my $amount0 = get("$bcreg listunspent | jq -r '.[$index] | .amount'");
		my $money = $amount0 - $fee;
        my $newrecipient0 = get("$bcreg getrawchangeaddress");
        my $rawtxhex0 = get("$bcreg -named createrawtransaction inputs='''[ { \"txid\": \"$utxo_txid0\", \"vout\": $utxo_vout0 } ]''' outputs='''{ \"$newrecipient0\": $money }'''");
        my $signedtx0 = get("$bcreg -named signrawtransaction hexstring=$rawtxhex0 | jq -r '.hex'");
        push @allTx, "$bcreg -named sendrawtransaction hexstring=$signedtx0";
}

#esecuzione finale
my $startTime = gettimeofday();
stamp("10: starting execution at  " . localtime(time()));
say "10: starting execution at  " . localtime(time());

for my $tx (@allTx)
{
        #say "\t" . get("$tx");
		get("$tx");
}

my $endTime = gettimeofday();
say "start " . $startTime . " | end: " . $endTime . " | time elapsed: " . ($endTime - $startTime);
stamp("start " . $startTime . " | end: " . $endTime . " | time elapsed: " . ($endTime - $startTime));
#END

#FUNCTIONS
sub get($cmd)
{
        chomp(my $out = `$cmd &> stressTest_main.log`);
        return $out;
}

sub stamp($data)
{
    open my $fh, '>>', "stressTest.log" or die "errore aprendo il file $!\n";
    flock $fh, 2;
    say $fh "$$-" . $data;
}

sub createAddresses($localAddresses)
{
        my @listAddress;
        for my $index(1 .. $localAddresses)
        {
				stamp("\t$index/" . $localAddresses . "..") if($index % 100 == 0 || $index == $localAddresses);
                push @listAddress, get("$bcreg getnewaddress");
        }
        return @listAddress;
}
