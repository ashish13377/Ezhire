// auth
package routes

import (
	"Ezhire/controllers"

	"github.com/gorilla/mux"
)

// AuthRoutes sets up the routes for authentication and password management
func AuthRoutes(router *mux.Router) {
	router.HandleFunc("/signup", controllers.Signup).Methods("POST")
	router.HandleFunc("/login", controllers.Login).Methods("POST")
	router.HandleFunc("/forgot-password", controllers.ForgotPassword).Methods("POST")
	router.HandleFunc("/reset-password", controllers.ResetPassword).Methods("POST")
	router.HandleFunc("/user-data", controllers.GetUserData).Methods("GET")
}
