package config

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var DB *mongo.Database
var UserCollection *mongo.Collection
var AdminCollection *mongo.Collection
var AdminQaCollection *mongo.Collection
var err error

func ConnectToDB() {
	//load the environment variables
	LoadEnvVariables()

	// Use the SetServerAPIOptions() method to set the version of the Stable API on the client
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(os.Getenv("DB_URL")).SetServerAPIOptions(serverAPI)

	// Create a new client and connect to the server
	Client, err = mongo.Connect(context.TODO(), opts)
	if err != nil {
		panic(err)
	}
	DB = Client.Database("helpdesk")
	UserCollection = DB.Collection("users")
	CreateIndexes(UserCollection)
	AdminCollection = DB.Collection("admins")
	CreateIndexes(AdminCollection)
	AdminQaCollection = DB.Collection("adminQa")
	CreateIndexes(AdminCollection)

	// Send a ping to confirm a successful connection
	if err := Client.Database("admin").RunCommand(context.TODO(), bson.D{{Key: "ping", Value: 1}}).Err(); err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")

}

func CreateIndexes(collection *mongo.Collection) {

	// Define the unique index on the email field
	indexModel := mongo.IndexModel{
		Keys:    bson.M{"email": 1}, // Create index on the "email" field
		Options: options.Index().SetUnique(true),
	}

	// Create the index
	_, err := collection.Indexes().CreateOne(context.Background(), indexModel)
	if err != nil {
		log.Fatalf("Failed to create unique index: %v", err)
	}
}
