package main

import (
	utils "Ezhire/db"
	"Ezhire/models"
	routes "Ezhire/router"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// App metadata
const (
	AppVersion = "1.0.0"
	Author     = "Ashish Kumar"
	License    = "MIT"
)

var wishlistCollection *mongo.Collection = utils.GetCollection("wishlist")

// GetLocalIP finds the local IP address of the main network adapter, prioritizing Wi-Fi connections
func GetLocalIP() (string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "", err
	}

	var wifiIP string
	for _, addr := range addrs {
		ipNet, ok := addr.(*net.IPNet)
		if ok && !ipNet.IP.IsLoopback() && ipNet.IP.To4() != nil {
			ip := ipNet.IP.String()
			// Print out all detected IPs for debugging
			fmt.Printf("Detected IP: %s\n", ip)

			// Prioritize Wi-Fi IP
			if strings.HasPrefix(ip, "192.168.") {
				wifiIP = ip
			}
		}
	}

	if wifiIP == "" {
		return "", fmt.Errorf("no suitable non-loopback IP address found")
	}

	return wifiIP, nil
}

// Handler function for the /search route
func SearchHandler(w http.ResponseWriter, r *http.Request) {
	// Get the query parameters
	query := r.URL.Query().Get("query")
	page := r.URL.Query().Get("page")
	employmentTypes := r.URL.Query().Get("employment_types")
	country := r.URL.Query().Get("country")
	numPages := r.URL.Query().Get("num_pages")
	datePosted := r.URL.Query().Get("date_posted")
	jobID := r.URL.Query().Get("job_id")

	// Create a slice to hold query parameters for the API request
	var queryParams []string

	// Append each parameter if it exists
	if query != "" {
		queryParams = append(queryParams, fmt.Sprintf("query=%s", query))
	}
	if page != "" {
		queryParams = append(queryParams, fmt.Sprintf("page=%s", page))
	}
	if employmentTypes != "" {
		queryParams = append(queryParams, fmt.Sprintf("employment_types=%s", employmentTypes))
	}
	if country != "" {
		queryParams = append(queryParams, fmt.Sprintf("country=%s", country))
	}
	if numPages != "" {
		queryParams = append(queryParams, fmt.Sprintf("num_pages=%s", numPages))
	}
	if datePosted != "" {
		queryParams = append(queryParams, fmt.Sprintf("date_posted=%s", datePosted))
	}
	if jobID != "" {
		queryParams = append(queryParams, fmt.Sprintf("job_id=%s", jobID))
	}

	// Combine query parameters into a single query string
	queryString := strings.Join(queryParams, "&")

	// Build the request to the external API
	apiURL := fmt.Sprintf("https://jsearch.p.rapidapi.com/search?%s", queryString)

	// Create the request with headers
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("X-RapidAPI-Key", os.Getenv("API_KEY"))
	req.Header.Set("X-RapidAPI-Host", "jsearch.p.rapidapi.com")

	// Perform the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to make request", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Decode the response into a dynamic map
	var apiResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		http.Error(w, "Failed to decode response", http.StatusInternalServerError)
		return
	}

	// Write the response as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(apiResponse); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// Handler function for /job-details
func JobDetailsHandler(w http.ResponseWriter, r *http.Request) {
	var wishlistItem models.Wishlist
	// Get query parameters
	query := r.URL.Query().Get("query")
	page := r.URL.Query().Get("page")
	employmentTypes := r.URL.Query().Get("employment_types")
	country := r.URL.Query().Get("country")
	numPages := r.URL.Query().Get("num_pages")
	datePosted := r.URL.Query().Get("date_posted")
	jobID := r.URL.Query().Get("job_id")

	// Create a slice for query parameters
	var queryParams []string

	// Append each parameter if it exists
	if query != "" {
		queryParams = append(queryParams, fmt.Sprintf("query=%s", query))
	}
	if page != "" {
		queryParams = append(queryParams, fmt.Sprintf("page=%s", page))
	}
	if employmentTypes != "" {
		queryParams = append(queryParams, fmt.Sprintf("employment_types=%s", employmentTypes))
	}
	if country != "" {
		queryParams = append(queryParams, fmt.Sprintf("country=%s", country))
	}
	if numPages != "" {
		queryParams = append(queryParams, fmt.Sprintf("num_pages=%s", numPages))
	}
	if datePosted != "" {
		queryParams = append(queryParams, fmt.Sprintf("date_posted=%s", datePosted))
	}
	if jobID != "" {
		queryParams = append(queryParams, fmt.Sprintf("job_id=%s", jobID))
	}

	// Combine query parameters into a single query string
	queryString := strings.Join(queryParams, "&")

	// Build the request to the external API
	apiURL := fmt.Sprintf("https://jsearch.p.rapidapi.com/job-details?%s", queryString)

	// Create the request
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	// Set headers for the API request
	req.Header.Set("X-RapidAPI-Key", os.Getenv("API_KEY"))
	req.Header.Set("X-RapidAPI-Host", "jsearch.p.rapidapi.com")

	// Perform the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to make request", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Decode the response from the API
	var apiResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		http.Error(w, "Failed to decode API response", http.StatusInternalServerError)
		return
	}

	// Check if the job exists
	wishlist := wishlistCollection.FindOne(context.Background(), bson.M{"job_id": jobID}).Decode(&wishlistItem)

	// Build the final response
	var exists bool
	if wishlist == mongo.ErrNoDocuments {
		exists = false
	} else {
		exists = true
	}

	// Send the combined response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":   apiResponse,
		"exists": exists,
	})
}

// HelloHandler handles the root path and returns a JSON response
func HelloHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"message": "Hello from this side !!!! 🎉",
	}

	// Set the response header content type to JSON
	w.Header().Set("Content-Type", "application/json")

	// Write the JSON response with status code 200
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func main() {

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	if utils.Client == nil {
		utils.ConnectDB()
	}
	ip, err := GetLocalIP()
	if err != nil {
		log.Fatalf("Error getting local IP address: %v", err)
	}
	// // Set up the router
	router := mux.NewRouter()

	// Initialize routes
	authRouter := router.PathPrefix("/auth").Subrouter()
	routes.AuthRoutes(authRouter)

	userRouter := router.PathPrefix("/user").Subrouter()
	routes.UserRoutes(userRouter)

	wishlistRouter := router.PathPrefix("/wishlist").Subrouter()
	routes.WishlistRoutes(wishlistRouter)

	router.HandleFunc("/search", SearchHandler).Methods("GET")
	router.HandleFunc("/job-details", JobDetailsHandler).Methods("GET")
	router.HandleFunc("/", HelloHandler).Methods("GET")
	// Print server information
	printServerInfo()

	// Get the port from environment variable or default to 8000
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// // Start the server
	// log.Printf("🚀 Server is running on 0.0.0.0:%s", port)
	// log.Fatal(http.ListenAndServe(fmt.Sprintf("0.0.0.0:%s", port), router))
	// Bind the server to the local IP address
	address := fmt.Sprintf("%s:%s", ip, port)
	log.Printf("🚀 Server is running on %s", address)
	log.Fatal(http.ListenAndServe(address, router))
}

func getPort() string {
	// Get the PORT environment variable, fallback to 8000 if not defined
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000" // Default port
	}
	return port
}

func printServerInfo() {
	// Colors
	bold := color.New(color.Bold).SprintFunc()
	yellow := color.New(color.FgYellow).SprintFunc()
	green := color.New(color.FgGreen).SprintFunc()
	blue := color.New(color.FgCyan).SprintFunc()

	// Table-style data
	fmt.Println(bold("======================================"))
	fmt.Printf("%s   %s\n", bold(yellow("App Version: ")), blue(AppVersion))
	fmt.Printf("%s   %s\n", bold(yellow("Author: ")), green(Author))
	fmt.Printf("%s   %s\n", bold(yellow("License: ")), blue(License))
	fmt.Printf("%s   %s\n", bold(yellow("Start Time: ")), green(time.Now().Format(time.RFC1123)))
	fmt.Printf("%s   %s\n", bold(yellow("Port: ")), green(getPort()))
	fmt.Printf("%s   %s\n", bold(yellow("DB_URI: ")), blue(os.Getenv("MONGO_URI")))
	fmt.Printf("%s   %s\n", bold(yellow("DB_NAME: ")), blue(os.Getenv("DB_NAME")))
	fmt.Println(bold("======================================"))
}
