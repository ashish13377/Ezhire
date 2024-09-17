package utils

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var DbName string

// ConnectDB initializes the MongoDB client and connects to the database.
func ConnectDB() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	Uri := os.Getenv("MONGO_URI")
	// fmt.Println("MongoDB URI: ", Uri)
	if Uri == "" {
		log.Fatal("MONGO_URI is not set in the environment variables")
	}

	DbName = os.Getenv("DB_NAME")
	if DbName == "" {
		log.Fatal("DB_NAME is not set in the environment variables")
	}
	// fmt.Println("DB Name: ", DbName)
	// client option
	clientOptions := options.Client().ApplyURI(Uri)
	// connect to mongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)
	// context.TODO() -> context with timeout of 10 seconds for connection establishment and 10 seconds for response timeout
	if err != nil {
		log.Fatal(err)
	}

	// check the connection
	fmt.Println("🎉 Connected to MongoDB!")
	Client = client
}

// GetCollection provides access to a specific collection in the MongoDB database.
func GetCollection(collectionName string) *mongo.Collection {
	if Client == nil {
		ConnectDB()
	}
	return Client.Database(DbName).Collection(collectionName)
}
