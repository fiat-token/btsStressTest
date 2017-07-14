use 5.022;
use warnings;
use Getopt::Long;
use experimental 'signatures';

Getopt::Long::Configure qw(gnu_getopt);

#default params
my $bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
my $addresses = 1000;
my $amount = 0.0499;
my $fee = 0.0001;

#get params
GetOptions
(
	'bcreg|b=s'    	=> \$bcreg,
	'addresses|ad=s'	=> \$addresses,
	'amount|am=s'   	=> \$amount,
	'fee|f=s'      	=> \$fee,
) or die "err options!\n";


my $money = $amount - $fee;

#output params
say "Executing script $0\n";
say "parameters:";
say "bcreg: $bcreg";
say "addresses: $addresses";
say "amount: $amount";
say "fee: $fee";
say "money: $money";


#creo mille address
say "\ncreazione mille address..";
my @listAddress = milleAddress($addresses);

#creo stringa contenente tutti gli outputs
say "creo stringa contenente tutti gli outputs..";
my $stringOutput = "\"" .  (join "\": $amount, \"", @listAddress) . "\": $amount";

#get utxo_txid
say "get utxo_txid..";
my $utxo_txid = get("$bcreg listunspent | jq -r '.[0] | .txid'");

#get utxo_vout
say "get utxo_vout..";
my $utxo_vout = get("$bcreg listunspent | jq -r '.[0] | .vout'");

#bcreg createrawtransaction
say "bcreg createrawtransaction..";
my $rawtxhex = get("$bcreg -named createrawtransaction inputs='''[ { \"txid\": \"$utxo_txid\", \"vout\": $utxo_vout } ]''' outputs='''{$stringOutput}'''");

#bcreg createrawtransaction
say "bcreg signrawtransaction..";
my $signedtx = get("$bcreg -named signrawtransaction hexstring=$rawtxhex | jq -r '.hex'");

#bcreg sendrawtransaction
say "bcreg sendrawtransaction..";
my $hashTx = get("$bcreg -named sendrawtransaction hexstring=$signedtx");

#mining
say "mining..";
my $cmdMining = get("$bcreg generate 1");

#inizio creazione e firma delle tx
say "inizio creazione e firma delle tx..";
my @allTx;
for my $index(0 .. @listAddress)
{
	say "$index/$#listAddress.." if($index % 20 == 0);
	
	my $utxo_txid0 = get("$bcreg listunspent | jq -r '.[$index] | .txid'");
	my $utxo_vout0 = get("$bcreg listunspent | jq -r '.[$index] | .vout'");
	my $newrecipient0 = get("$bcreg getrawchangeaddress");
	my $rawtxhex0 = get("$bcreg -named createrawtransaction inputs='''[ { \"txid\": \"$utxo_txid0\", \"vout\": $utxo_vout0 } ]''' outputs='''{ \"$newrecipient0\": $money }'''");
	my $signedtx0 = get("$bcreg -named signrawtransaction hexstring=$rawtxhex0 | jq -r '.hex'");
	push @allTx, "$bcreg -named sendrawtransaction hexstring=$signedtx0";
}

#esecuzione finale
my $startTime = time();
say "inizio esecuzione: " . localtime($startTime);

for my $tx (@allTx)
{
	say get("$tx");
}

my $endTime = time();
say "tempo esecuzione: " . ($endTime - $startTime);
#END

#FUNCTIONS
sub get($cmd)
{
	chomp(my $out = `$cmd 2>&1`);
	return $cmd;
}

sub milleAddress($addresses)
{
	my @listAddress;
	for (1 .. $addresses)
	{
		push @listAddress, get("$bcreg getnewaddress");
	}
	return \@listAddress;
}
