package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                    primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProfileImage          string             `bson:"profileimage" json:"profileimage"`
	FirstName             string             `bson:"first_name" json:"first_name" validate:"required"`
	LastName              string             `bson:"last_name" json:"last_name" validate:"required"`
	Email                 string             `bson:"email" json:"email" validate:"required,email"`
	Password              string             `bson:"password" json:"password" validate:"required"`
	Phone                 string             `bson:"phone,omitempty" json:"phone,omitempty"`
	DateOfBirth           string             `bson:"date_of_birth,omitempty" json:"date_of_birth,omitempty"`
	Gender                string             `bson:"gender,omitempty" json:"gender,omitempty"`
	VerificationOTP       string             `bson:"verification_otp,omitempty" json:"verification_otp,omitempty"`
	VerificationOTPExpiry time.Time          `bson:"verification_otp_expiry,omitempty" json:"verification_otp_expiry,omitempty"`
}
