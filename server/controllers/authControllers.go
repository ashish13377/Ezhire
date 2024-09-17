package controllers

import (
	utils "Ezhire/db"
	"Ezhire/models"
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

var userCollectionAuth *mongo.Collection = utils.GetCollection("users")

// GenerateOTP generates a random 6-digit OTP
func GenerateOTP() string {
	return strconv.Itoa(100000 + rand.Intn(900000))
}

// Signup handles POST requests to create a new user
func Signup(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid input ❌", http.StatusBadRequest)
		return
	}

	// Check if the user already exists
	existingUser := models.User{}
	err = userCollectionAuth.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		http.Error(w, "User already exists 🚫", http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password 🛠️", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	if user.ProfileImage == "" {
		user.ProfileImage = "https://res.cloudinary.com/diyncva2v/image/upload/v1704839111/profile_by0avs.png"
	}

	// Create a new user
	_, err = userCollectionAuth.InsertOne(context.Background(), user)
	if err != nil {
		http.Error(w, "Failed to create user 🛠️", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User created successfully ✅",
	})
}

// Login handles POST requests to authenticate a user and generate a JWT
func Login(w http.ResponseWriter, r *http.Request) {
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&loginData)
	if err != nil {
		http.Error(w, "Invalid input ❌", http.StatusBadRequest)
		return
	}

	// Find the user by email
	user := models.User{}
	err = userCollectionAuth.FindOne(context.Background(), bson.M{"email": loginData.Email}).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid credentials 🚫", http.StatusUnauthorized)
		return
	}

	// Check the password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password))
	if err != nil {
		http.Error(w, "Invalid credentials 🚫", http.StatusUnauthorized)
		return
	}

	// Generate a JWT token
	claims := jwt.MapClaims{
		"userId": user.ID,
		"exp":    time.Now().Add(30 * 24 * time.Hour).Unix(), // 30 days expiration
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))
	if err != nil {
		http.Error(w, "Failed to generate token 🛠️", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":    tokenString,
		"userData": user,
	})
}

// ForgotPassword handles POST requests to send an OTP for password reset
func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Email string `json:"email"`
	}
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Invalid input ❌", http.StatusBadRequest)
		return
	}

	// Find the user by email
	user := models.User{}
	err = userCollectionAuth.FindOne(context.Background(), bson.M{"email": requestData.Email}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found 🚫", http.StatusNotFound)
		return
	}

	// Generate and hash the OTP
	otp := GenerateOTP()
	hashedOTP, err := bcrypt.GenerateFromPassword([]byte(otp), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash OTP 🛠️", http.StatusInternalServerError)
		return
	}
	user.VerificationOTP = string(hashedOTP)
	user.VerificationOTPExpiry = time.Now().Add(10 * time.Minute)
	_, err = userCollectionAuth.UpdateOne(context.Background(), bson.M{"email": requestData.Email}, bson.M{"$set": bson.M{
		"verificationOTP":       user.VerificationOTP,
		"verificationOTPExpiry": user.VerificationOTPExpiry,
	}})
	if err != nil {
		http.Error(w, "Failed to update OTP 🛠️", http.StatusInternalServerError)
		return
	}

	// Send the OTP via email
	mailer := gomail.NewMessage()
	mailer.SetHeader("From", os.Getenv("MAIL_USER"))
	mailer.SetHeader("To", requestData.Email)
	mailer.SetHeader("Subject", "Password Reset OTP")
	mailer.SetBody("text/plain", fmt.Sprintf("Your OTP for password reset is: %s", otp))

	dialer := gomail.NewDialer(os.Getenv("HOST"), 465, os.Getenv("MAIL_USER"), os.Getenv("MAIL_PASS"))
	err = dialer.DialAndSend(mailer)
	if err != nil {
		http.Error(w, "Failed to send OTP email 🛠️", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "OTP sent successfully ✅",
	})
}

// ResetPassword handles POST requests to reset the user's password
func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Email    string `json:"email"`
		OTP      string `json:"otp"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Invalid input ❌", http.StatusBadRequest)
		return
	}

	// Find the user by email
	user := models.User{}
	err = userCollectionAuth.FindOne(context.Background(), bson.M{"email": requestData.Email}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found 🚫", http.StatusNotFound)
		return
	}

	// Check if the OTP is valid and not expired
	err = bcrypt.CompareHashAndPassword([]byte(user.VerificationOTP), []byte(requestData.OTP))
	if err != nil || user.VerificationOTPExpiry.Before(time.Now()) {
		http.Error(w, "Invalid or expired OTP 🚫", http.StatusUnauthorized)
		return
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(requestData.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password 🛠️", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)
	user.VerificationOTP = ""
	user.VerificationOTPExpiry = time.Time{} // Reset OTP expiry

	_, err = userCollectionAuth.UpdateOne(context.Background(), bson.M{"email": requestData.Email}, bson.M{"$set": bson.M{
		"password":              user.Password,
		"verificationOTP":       user.VerificationOTP,
		"verificationOTPExpiry": user.VerificationOTPExpiry,
	}})
	if err != nil {
		http.Error(w, "Failed to reset password 🛠️", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Password reset successfully ✅",
	})
}

// AuthenticateToken handles token verification
func AuthenticateToken(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var requestData struct {
			Token string `json:"token"`
		}
		err := json.NewDecoder(r.Body).Decode(&requestData)
		if err != nil {
			http.Error(w, "Invalid input ❌", http.StatusBadRequest)
			return
		}

		tokenString := requestData.Token
		if tokenString == "" {
			http.Error(w, "Token is required 🚫", http.StatusUnauthorized)
			return
		}

		// Parse the JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("SECRET_KEY")), nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Invalid token 🚫", http.StatusForbidden)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims 🚫", http.StatusForbidden)
			return
		}

		userId, ok := claims["userId"].(string)
		if !ok {
			http.Error(w, "Invalid token claims 🚫", http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), ContextKey("userID"), userId)

		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// GetUserData handles GET requests to retrieve user data
func GetUserData(w http.ResponseWriter, r *http.Request) {
	tokens := r.URL.Query().Get("token")
	
	tokenString := tokens
	if tokenString == "" {
		http.Error(w, "Token is required 🚫", http.StatusUnauthorized)
		return
	}

	// Parse the JWT token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET_KEY")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token 🚫", http.StatusForbidden)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims 🚫", http.StatusForbidden)
		return
	}

	userId, ok := claims["userId"].(string)
	if !ok {
		http.Error(w, "Invalid token claims 🚫", http.StatusForbidden)
		return
	}

	// // Extract the userID from the context
	// userId := r.Context().Value(ContextKey("userID")).(string)
	// fmt.Printf("userId: %v\n", userId)

	// Convert the userId string to MongoDB ObjectID
	objectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		http.Error(w, "Invalid User ID format 🚫", http.StatusBadRequest)
		return
	}

	// Find the user by ObjectID
	user := models.User{}
	err = userCollectionAuth.FindOne(context.Background(), bson.M{"_id": objectId}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "User not found 🚫", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error 🚫", http.StatusInternalServerError)
		return
	}

	// Return the user data in the response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"userData": user,
	})
}
