// user
package routes

import (
	"Ezhire/controllers"

	"github.com/gorilla/mux"
)

// UserRoutes sets up the routes for user profile management
func UserRoutes(router *mux.Router) {
	router.HandleFunc("/profile", controllers.AuthenticateToken(controllers.GetUserProfile)).Methods("GET")
	router.HandleFunc("/update-profile", controllers.UpdateUserProfile).Methods("PUT")
	router.HandleFunc("/delete-account", controllers.AuthenticateToken(controllers.DeleteUser)).Methods("DELETE")
}
