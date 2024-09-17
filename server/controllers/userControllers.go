package controllers

import (
	utils "Ezhire/db"
	"Ezhire/middleware"
	"Ezhire/models"
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = utils.GetCollection("users")

// GetUserProfile handles GET requests for user profiles
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.ContextKey("userID")).(string)
	if !ok {
		http.Error(w, "User ID not found in context 🛑", http.StatusUnauthorized)
		return
	}

	var user models.User
	err := userCollection.FindOne(context.Background(), bson.M{"_id": userId}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found 🚫", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

// UpdateUserProfile handles PUT requests to update user profiles
func UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	// Extract the user ID from the query parameters
	userId := r.URL.Query().Get("userId")

	// Convert the userId string to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		http.Error(w, "Invalid user ID format ❌", http.StatusBadRequest)
		return
	}

	// Decode the request body into a map to dynamically update only the provided fields
	var updateFields map[string]interface{}
	err = json.NewDecoder(r.Body).Decode(&updateFields)
	if err != nil {
		http.Error(w, "Invalid input ❌", http.StatusBadRequest)
		return
	}

	// If no fields are provided in the body, return an error
	if len(updateFields) == 0 {
		http.Error(w, "No fields provided for update 🚫", http.StatusBadRequest)
		return
	}

	// Dynamically build the update object for MongoDB
	update := bson.M{"$set": updateFields}

	// Perform the update operation
	result, err := userCollection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	if err != nil {
		http.Error(w, "Failed to update user 🛠️", http.StatusInternalServerError)
		return
	}

	// Check if a document was modified
	if result.ModifiedCount == 0 {
		http.Error(w, "User not found or no fields were updated 🚫", http.StatusNotFound)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User profile updated successfully ✅"))
}

// DeleteUser handles DELETE requests to remove a user
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.ContextKey("userID")).(string)
	if !ok {
		http.Error(w, "User ID not found in context 🛑", http.StatusUnauthorized)
		return
	}

	_, err := userCollection.DeleteOne(context.Background(), bson.M{"_id": userId})
	if err != nil {
		http.Error(w, "Failed to delete user ❌", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User deleted successfully 🗑️"))
}
