# HOW TO CALL EVM SMART CONTRACT USING GO

# Loading a Smart Contract

These section requires knowledge of how to compile a smart contract's
ABI to a Go contract file. If you haven't already gone through it, please
read the section first.
Once you've compiled your smart contract's ABI to a Go package using
the abigen tool, the next step is to call the "New" method, which is in the
format New<ContractName> , so in our example if you recall it's going to
be NewStore. This initializer method takes in the address of the smart
contract and returns a contract instance that you can start interact with it.

Full code
Commands
Store.sol

```go
address := common.HexToAddress("0x147B8eb97fD247D06C4006D269c90C")
instance, err := store.NewStore(address, client)
if err != nil {
log.Fatal(err)
}
_ = instance // we'll be using this in the next section
```

solc --abi Store.sol
solc --bin Store.sol
abigen --bin=Store_sol_Store.bin --abi=Store_sol_Store.abi --pkg=store --out=

Setting up the Client

```solidity

pragma solidity ^0.4.24;

contract Store {

	event ItemSet(bytes32 key, bytes32 value);
	string public version;
	mapping (bytes32 => bytes32) public items;

	constructor(string _version) public {
		version = _version;
	}
	function setItem(bytes32 key, bytes32 value) external {
		items[key] = value;
		emit ItemSet(key, value);
	}
}
```

contract_load.go

```go
package main
import (
"fmt"
"log"
"github.com/ethereum/go-ethereum/common"
"github.com/ethereum/go-ethereum/ethclient"
store "./contracts" // for demo
)
func main() {
client, err := ethclient.Dial("https://rinkeby.infura.io")
if err != nil {
log.Fatal(err)
}
address := common.HexToAddress("0x8063E4BA4b473DDdAc016dF9765EB869fcFAf843")
instance, err := store.NewStore(address, client)
if err != nil {
log.Fatal(err)
}
fmt.Println("contract is loaded")
_ = instance
}
```

# Querying a Smart Contract

These section requires knowledge of how to compile a smart contract's
ABI to a Go contract file. If you haven't already gone through it, please
read the section first.

In the previous section we learned how to initialize a contract instance in
our Go application. Now we're going to read the smart contract using the
provided methods by the new contract instance. If you recall we had a
global variable named version in our contract that was set during
deployment. Because it's public that means that they'll be a getter
function automatically created for us. Constant and view functions also
accept bind.CallOpts as the first argument. To learn about what options
you can pass checkout the type's documentation but usually this is set to
nil .

```go

version, err := instance.Version(nil)
if err != nil {
log.Fatal(err)
}
fmt.Println(version) // "1.0"
```

Full code
Commands
Store.sol
solc --abi Store.sol
solc --bin Store.sol

abigen --bin=Store_sol_Store.bin --abi=Store_sol_Store.abi --pkg=store --out=

```solidity

pragma solidity ^0.4.24;
contract Store {
event ItemSet(bytes32 key, bytes32 value);
string public version;
mapping (bytes32 => bytes32) public items;
constructor(string _version) public {
version = _version;
}
function setItem(bytes32 key, bytes32 value) external {
items[key] = value;
emit ItemSet(key, value);
}
}
```

### Full Code

```go

package main
import (
"fmt"
"log"
"[github.com/ethereum/go-ethereum/common](http://github.com/ethereum/go-ethereum/common)"
"[github.com/ethereum/go-ethereum/ethclient](http://github.com/ethereum/go-ethereum/ethclient)"
store "./contracts" // for demo
)
func main() {
client, err := ethclient.Dial("[https://rinkeby.infura.io](https://rinkeby.infura.io/)")
if err != nil {
log.Fatal(err)
}
address := common.HexToAddress("0x8063E4BA4b473DDdAc016dF9765EB869fcFAf843")
instance, err := store.NewStore(address, client)
if err != nil {
log.Fatal(err)
}
version, err := instance.Version(nil)
if err != nil {
log.Fatal(err)
}
fmt.Println(version) // "1.0"
}
```

# Writing to a Smart Contract

These section requires knowledge of how to compile a smart contract's
ABI to a Go contract file. If you haven't already gone through it, please
read the section first.
Writing to a smart contract requires us to sign the sign transaction with
our private key.
We'll also need to figure the nonce and gas price.
Next we create a new keyed transactor which takes in the private key.

```go
auth := bind.NewKeyedTransactor(privateKey)
Then we need to set the standard transaction options attached to the
keyed transactor.
privateKey, err := crypto.HexToECDSA("fad9c8855b740a0b7ed4c221dbad0f3")
if err != nil {
log.Fatal(err)
}
publicKey := privateKey.Public()
publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
if !ok {
log.Fatal("cannot assert type: publicKey is not of type *ecdsa.PublicKey")
}
fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
if err != nil {
log.Fatal(err)
}
gasPrice, err := client.SuggestGasPrice(context.Background())
if err != nil {
log.Fatal(err)
}
auth.Nonce = big.NewInt(int64(nonce))
auth.Value = big.NewInt(0) // in wei
auth.GasLimit = uint64(300000) // in units
auth.GasPrice = gasPrice
```

Now we load an instance of the smart contract. If you recall in the
previous sections we create a contract called Store and generated a Go
package file using the abigen tool. To initialize it we just invoke the New
method of the contract package and give the smart contract address and
the ethclient, which returns a contract instance that we can use.
The smart contract that we created has an external method called
SetItem which takes in two arguments (key, value) in the from of solidity
bytes32 . This means that the Go contract package requires us to pass a
byte array of length 32 bytes. Invoking the SetItem method requires us to
pass the auth object we created earlier. Behind the scenes this method
will encode this function call with it's arguments, set it as the data
property of the transaction, and sign it with the private key. The result will
be a signed transaction object.

```go

address := common.HexToAddress("0x8063E4BA4b473DDdAc016dF9765EB869fcFAf843")
instance, err := store.NewStore(address, client)
if err != nil {
log.Fatal(err)
}
key := [32]byte{}
value := [32]byte{}
copy(key[:], []byte("foo"))
copy(value[:], []byte("bar"))
tx, err := instance.SetItem(auth, key, value)
if err != nil {
log.Fatal(err)
}
fmt.Printf("tx sent: %s", tx.Hash().Hex()) // tx sent: 0x8d490e535678e9a2436

```

We can see now that the transaction has been successfully sent on the
network:
[https://rinkeby.etherscan.io/tx/0x8d490e535678e9a24360e955d75b27ad](https://rinkeby.etherscan.io/tx/0x8d490e535678e9a24360e955d75b27ad)
307bdfb97a1dca51d0f3035dcee3e870

To verify that the key/value was set, we read the smart contract mapping
value.

```go

result, err := instance.Items(nil, key)
if err != nil {
log.Fatal(err)
}
fmt.Println(string(result[:])) // "bar"
```

There you have it.
Full code
Store.sol

```solidity

pragma solidity ^0.4.24;
contract Store {
event ItemSet(bytes32 key, bytes32 value);
string public version;
mapping (bytes32 => bytes32) public items;
constructor(string _version) public {
version = _version;
}
function setItem(bytes32 key, bytes32 value) external {
items[key] = value;
emit ItemSet(key, value);
}
}

```

### Full Code

```go
package main
import (
"fmt"
"log"
"github.com/ethereum/go-ethereum/accounts/abi/bind"
"github.com/ethereum/go-ethereum/common"
"github.com/ethereum/go-ethereum/ethclient"
store "./contracts" // for demo
)
func main() {
client, err := ethclient.Dial("https://rinkeby.infura.io")
if err != nil {
log.Fatal(err)
}
privateKey, err := crypto.HexToECDSA("fad9c8855b740a0b7ed4c221dbad0")
if err != nil {
log.Fatal(err)
}
publicKey := privateKey.Public()
publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
if !ok {
log.Fatal("cannot assert type: publicKey is not of type *ecdsa.PublicKey")
}
fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
if err != nil {
log.Fatal(err)
}
gasPrice, err := client.SuggestGasPrice(context.Background())
if err != nil {
log.Fatal(err)
}
auth := bind.NewKeyedTransactor(privateKey)
auth.Nonce = big.NewInt(int64(nonce))
auth.Value = big.NewInt(0) // in wei
auth.GasLimit = uint64(300000) // in units
auth.GasPrice = gasPrice
address := common.HexToAddress("0x8063E4BA4b473DDdAc016dF9765EB869fcFAf843")
instance, err := store.NewStore(address, client)
if err != nil {
log.Fatal(err)
}
key := [32]byte{}
value := [32]byte{}
copy(key[:], []byte("foo"))
copy(value[:], []byte("bar"))
tx, err := instance.SetItem(auth, key, value)
if err != nil {
log.Fatal(err)
}
fmt.Printf("tx sent: %s", tx.Hash().Hex()) // tx sent: 0x8d490e535678e9a24
result, err := instance.Items(nil, key)
if err != nil {
log.Fatal(err)
}
fmt.Println(string(result[:])) // "bar"
}
```

# Reading Smart Contract Bytecode

Sometimes you'll need to read the bytecode of a deployed smart
contract. Since all the smart contract bytecode lives on the blockchain,
we can easily fetch it.
First set up the client and the smart contract address you want to read
the bytecode of.

```go
client, err := ethclient.Dial("[https://rinkeby.infura.io](https://rinkeby.infura.io/)")
if err != nil {
log.Fatal(err)
}
contractAddress := common.HexToAddress("0x8063E4BA4b473DDdAc016dF9765EB869fcFAf843")
```

Now all you have to is call the codeAt method of the client. The codeAt
method accepts a smart contract address and an optional block number,
and returns the bytecode in bytes format.

```go
bytecode, err := client.CodeAt(context.Background(), contractAddress, nil) //
if err != nil {
log.Fatal(err)
}
fmt.Printl
```

### Full Code

```go
package main
import (
"context"
"encoding/hex"
"fmt"
"log"
"[github.com/ethereum/go-ethereum/common](http://github.com/ethereum/go-ethereum/common)"
"[github.com/ethereum/go-ethereum/ethclient](http://github.com/ethereum/go-ethereum/ethclient)"
)
func main() {
client, err := ethclient.Dial("[https://rinkeby.infura.io](https://rinkeby.infura.io/)")
if err != nil {
log.Fatal(err)
}
contractAddress := common.HexToAddress("0x8063E4BA4b473DDdAc016dF9765EB869fcFAf843")
bytecode, err := client.CodeAt(context.Background(), contractAddress, nil)
if err != nil {
log.Fatal(err)
}
fmt.Println(hex.EncodeToString(bytecode)) // 60806...10029
}
```

# Querying an ERC20 Token Smart

Contract
First create an ERC20 smart contract interface. This is just a contract
with the function definitions of the functions that you can call.

```solidity
pragma solidity ^0.4.24;
contract ERC20 {
string public constant name = "";
string public constant symbol = "";
uint8 public constant decimals = 0;
function totalSupply() public constant returns (uint);
function balanceOf(address tokenOwner) public constant returns (uint ba
function allowance(address tokenOwner, address spender) public constan
function transfer(address to, uint tokens) public returns (bool success);
function approve(address spender, uint tokens) public returns (bool succe
function transferFrom(address from, address to, uint tokens) public retur
event Transfer(address indexed from, address indexed to, uint tokens);
event Approval(address indexed tokenOwner, address indexed spender, u
}
```

Then compile the smart contract to the JSON ABI, and create a Go
token package out of the ABI using abigen .

solc --abi erc20.sol
abigen --abi=erc20_sol_ERC20.abi --pkg=token --out=erc20.go

Assuming we already have Ethereum client set up as usual, we can now
import the new token package into our application and instantiate it. In
this example we'll be using the Golem token.

```go
tokenAddress := common.HexToAddress("0xa74476443119A942dE498590F")
instance, err := token.NewToken(tokenAddress, client)
if err != nil {
log.Fatal(err)
}
```

We may now call any ERC20 method that we like. For example, we can
query the token balance of a user

```go
address := common.HexToAddress("0x0536806df512d6cdde913cf95c9886f6")
bal, err := instance.BalanceOf(&bind.CallOpts{}, address)
if err != nil {
log.Fatal(err)
}
fmt.Printf("wei: %s\n", bal) // "wei: 74605500647408739782407023"
```

We can also read the public variables of the ERC20 smart contract.

```go
name, err := instance.Name(&bind.CallOpts{})
if err != nil {
log.Fatal(err)
}
symbol, err := instance.Symbol(&bind.CallOpts{})
if err != nil {
log.Fatal(err)
}
decimals, err := instance.Decimals(&bind.CallOpts{})
if err != nil {
log.Fatal(err)
}
fmt.Printf("name: %s\n", name) // "name: Golem Network"
fmt.Printf("symbol: %s\n", symbol) // "symbol: GNT"
fmt.Printf("decimals: %v\n", decimals) // "decimals: 18"
```

```go
//We can do some simple math to convert the balance into a human
//readable decimal format.

address := common.HexToAddress("0x0536806df512d6cdde913cf95c9886f6")
bal, err := instance.BalanceOf(&bind.CallOpts{}, address)
if err != nil {
log.Fatal(err)
}
fmt.Printf("wei: %s\n", bal) // "wei: 74605500647408739782407023"
fbal := new(big.Float)
fbal.SetString(bal.String())
value := new(big.Float).Quo(fbal, big.NewFloat(math.Pow10(int(decimals))))
fmt.Printf("balance: %f", value) // "balance: 74605500.647409"
```

### Solidity Code

```solidity
pragma solidity ^0.4.24;
contract ERC20 {
string public constant name = "";
string public constant symbol = "";
uint8 public constant decimals = 0;
function totalSupply() public constant returns (uint);
function balanceOf(address tokenOwner) public constant returns (uint ba
function allowance(address tokenOwner, address spender) public constan
function transfer(address to, uint tokens) public returns (bool success);
function approve(address spender, uint tokens) public returns (bool succe
function transferFrom(address from, address to, uint tokens) public retur
event Transfer(address indexed from, address indexed to, uint tokens);
event Approval(address indexed tokenOwner, address indexed spender, u
}
```

### Full Code:

```solidity
package main
import (
"fmt"
"log"
"math"
"math/big"
"[github.com/ethereum/go-ethereum/accounts/abi/bind](http://github.com/ethereum/go-ethereum/accounts/abi/bind)"
"[github.com/ethereum/go-ethereum/common](http://github.com/ethereum/go-ethereum/common)"
"[github.com/ethereum/go-ethereum/ethclient](http://github.com/ethereum/go-ethereum/ethclient)"
token "./contracts_erc20" // for demo
)
func main() {
client, err := ethclient.Dial("[https://mainnet.infura.io](https://mainnet.infura.io/)")
if err != nil {
log.Fatal(err)
}
// Golem (GNT) Address
tokenAddress := common.HexToAddress("0xa74476443119A942dE498590
instance, err := token.NewToken(tokenAddress, client)
if err != nil {
log.Fatal(err)
}
address := common.HexToAddress("0x0536806df512d6cdde913cf95c9886
bal, err := instance.BalanceOf(&bind.CallOpts{}, address)
if err != nil {
log.Fatal(err)
}
name, err := [instance.Name](http://instance.name/)(&bind.CallOpts{})
if err != nil {
log.Fatal(err)
}
symbol, err := instance.Symbol(&bind.CallOpts{})
if err != nil {
log.Fatal(err)
}
decimals, err := instance.Decimals(&bind.CallOpts{})
if err != nil {
log.Fatal(err)
}
fmt.Printf("name: %s\n", name) // "name: Golem Network"
fmt.Printf("symbol: %s\n", symbol) // "symbol: GNT"
fmt.Printf("decimals: %v\n", decimals) // "decimals: 18"
fmt.Printf("wei: %s\n", bal) // "wei: 74605500647408739782407023"
fbal := new(big.Float)
fbal.SetString(bal.String())
value := new(big.Float).Quo(fbal, big.NewFloat(math.Pow10(int(decimals))
fmt.Printf("balance: %f", value) // "balance: 74605500.647409"
}
```
