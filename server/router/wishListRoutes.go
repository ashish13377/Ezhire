// wishlist
package routes

import (
	"Ezhire/controllers"

	"github.com/gorilla/mux"
)

// WishlistRoutes sets up the routes for wishlist management
func WishlistRoutes(router *mux.Router) {
	router.HandleFunc("/add", controllers.AddToWishlist).Methods("POST")
	router.HandleFunc("/update/{job_id}", controllers.UpdateWishlistItem).Methods("PUT")
	router.HandleFunc("/delete", controllers.DeleteFromWishlist).Methods("DELETE")
	router.HandleFunc("/check", controllers.CheckJobIdInWishlist).Methods("GET")
	router.HandleFunc("/all", controllers.GetAllWishlistItems).Methods("GET")
}
