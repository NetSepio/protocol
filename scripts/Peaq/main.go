package main

import (
	"context"
	// "crypto/ecdsa"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/big"
	"os"
	"strings"

	// "strconv"
	// "time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"

	// "github.com/ethereum/go-ethereum/core/types"
	// "github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
)

// NetSepioV1 represents our contract instance
type NetSepioV1 struct {
	abi     abi.ABI
	address common.Address
	client  *ethclient.Client
}

// Add this struct to parse the ABI JSON
type ContractABI struct {
	ABI json.RawMessage `json:"abi"`
}

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found. Using environment variables instead.")
	}

	PRIVATE_KEY := os.Getenv("PRIVATE_KEY")

	client, err := ethclient.Dial(os.Getenv("ALCHEMY_URL"))

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("we have a connection")

	fmt.Println(PRIVATE_KEY)
	fmt.Println(client)

	for {

		fmt.Println("\nHey you are in a blockchain app, where you can do the following: ")
		fmt.Println("\n1. Get account balance\n2.Read the node data\n0. Exit")
		fmt.Println("\nEnter the option: ")
		var option int
		fmt.Scanln(&option)
		if option == 0 {
			fmt.Println("Exiting...")
			fmt.Println("Thank you for using my app")
			break
		}
		switch option {
		case 1:
			fmt.Println("Enter the address: ")
			var address string
			fmt.Scanln(&address)
			getAccountBalance(client, address)
		case 2:
			fmt.Println("Enter the node id: ")
			var nodeId string
			fmt.Scanln(&nodeId)
			readNodeData(client, nodeId)
		}
	}

}

func getAccountBalance(client *ethclient.Client, address string) string {
	account := common.HexToAddress(address)
	balance, err := client.BalanceAt(context.Background(), account, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(balance, " wei")

	// Create a new big.Float variable to store the balance
	fbalance := new(big.Float)

	// Convert the balance (which is in wei) from big.Int to big.Float
	fbalance.SetString(balance.String())

	// Convert wei to ETH by dividing the balance by 10^18 (1 ETH = 10^18 wei)
	// Using Quo() for division and math.Pow10(18) to get 10^18
	ethValue := new(big.Float).Quo(fbalance, big.NewFloat(math.Pow10(18)))

	// Format to 3 decimal places
	balanceEthStr := fmt.Sprintf("%.3f", ethValue)
	fmt.Printf("%s ETH\n", balanceEthStr)
	return balanceEthStr
}

func readNodeData(client *ethclient.Client, nodeId string) {
	fmt.Printf("Reading node data for ID: %s...\n", nodeId)

	contractAddress := common.HexToAddress("0x8063E4BA4b473DDdAc016dF9765EB869fcFAf843")

	// Read and parse the ABI from the JSON file
	abiFile, err := os.ReadFile("ABI.json")
	if err != nil {
		log.Fatal(fmt.Errorf("failed to read ABI file: %v", err))
	}

	var contractABI ContractABI
	if err := json.Unmarshal(abiFile, &contractABI); err != nil {
		log.Fatal(fmt.Errorf("failed to parse ABI JSON: %v", err))
	}

	// Parse the ABI
	parsedABI, err := abi.JSON(strings.NewReader(string(contractABI.ABI)))
	if err != nil {
		log.Fatal(fmt.Errorf("failed to parse ABI: %v", err))
	}

	instance := &NetSepioV1{
		abi:     parsedABI,
		address: contractAddress,
		client:  client,
	}

	// Call the nodes mapping
	data, err := instance.abi.Pack("nodes", nodeId)
	if err != nil {
		log.Fatal(fmt.Errorf("failed to pack data: %v", err))
	}

	msg := ethereum.CallMsg{
		To:   &instance.address,
		Data: data,
	}

	result, err := client.CallContract(context.Background(), msg, nil)
	if err != nil {
		log.Fatal(fmt.Errorf("failed to call contract: %v", err))
	}

	fmt.Printf("Node data: %x\n", result)
}
