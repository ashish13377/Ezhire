package middleware

// Define a custom type for the context key
type ContextKey string

const (
	UserIDKey ContextKey = "userID"
)
