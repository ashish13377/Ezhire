package controllers

import (
	utils "Ezhire/db"
	"Ezhire/models"
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var wishlistCollection *mongo.Collection = utils.GetCollection("wishlist")

// AddToWishlist handles POST requests to add an item to the wishlist
func AddToWishlist(w http.ResponseWriter, r *http.Request) {
	var wishlistItem models.Wishlist
	err := json.NewDecoder(r.Body).Decode(&wishlistItem)
	if err != nil {
		http.Error(w, "Invalid input ❌", http.StatusBadRequest)
		return
	}

	_, err = wishlistCollection.InsertOne(context.Background(), wishlistItem)
	if err != nil {
		http.Error(w, "Failed to add item to wishlist 🛠️", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Item added to wishlist successfully ✅",
	})
}

// UpdateWishlistItem handles PUT requests to update an item in the wishlist
func UpdateWishlistItem(w http.ResponseWriter, r *http.Request) {
	jobID := r.URL.Query().Get("job_id")
	var updatedData map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&updatedData)
	if err != nil {
		http.Error(w, "Invalid input ❌", http.StatusBadRequest)
		return
	}

	filter := bson.M{"job_id": jobID}
	update := bson.M{"$set": bson.M{"data": updatedData}}

	result, err := wishlistCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		http.Error(w, "Failed to update item 🛠️", http.StatusInternalServerError)
		return
	}

	if result.ModifiedCount > 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Item updated successfully ✅",
		})
	} else {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Item not found or not updated 🚫",
		})
	}
}

// DeleteFromWishlist handles DELETE requests to remove an item from the wishlist
func DeleteFromWishlist(w http.ResponseWriter, r *http.Request) {
	jobID := r.URL.Query().Get("job_id")

	result, err := wishlistCollection.DeleteOne(context.Background(), bson.M{"job_id": jobID})
	if err != nil {
		http.Error(w, "Failed to delete item ❌", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount > 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Item deleted successfully 🗑️",
		})
	} else {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Item not found or not deleted 🚫",
		})
	}
}

// CheckJobIdInWishlist handles GET requests to check if a job_id exists in the wishlist
func CheckJobIdInWishlist(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	jobID := r.URL.Query().Get("job_id")

	var result models.Wishlist
	err := wishlistCollection.FindOne(context.Background(), bson.M{"userId": userId, "job_id": jobID}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"exists": false,
			})
			return
		}
		http.Error(w, "Internal Server Error 🛠️", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exists": true,
	})
}

// GetAllWishlistItems handles GET requests to get all wishlist items for a specific user
func GetAllWishlistItems(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")

	// Convert the userId string to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		http.Error(w, "Invalid user ID format ❌", http.StatusBadRequest)
		return
	}

	// Query the database using the correct field name ("user_id")
	cursor, err := wishlistCollection.Find(context.Background(), bson.M{"user_id": objectID})
	if err != nil {
		http.Error(w, "Failed to fetch wishlist items 🛠️", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var wishlistItems []models.Wishlist
	for cursor.Next(context.Background()) {
		var item models.Wishlist
		if err := cursor.Decode(&item); err != nil {
			http.Error(w, "Failed to decode wishlist item ❌", http.StatusInternalServerError)
			return
		}
		wishlistItems = append(wishlistItems, item)
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Error encountered while processing cursor ❌", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"wishlistItems": wishlistItems,
	})
}
