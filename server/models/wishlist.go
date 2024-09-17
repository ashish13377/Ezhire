package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Wishlist struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID            primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`
	JobID             string             `bson:"job_id" json:"job_id" validate:"required"`
	EmployerLogo      string             `bson:"employer_logo" json:"employer_logo" validate:"required"`
	JobTitle          string             `bson:"job_title" json:"job_title" validate:"required"`
	JobEmploymentType string             `bson:"job_employment_type" json:"job_employment_type" validate:"required"`
	Data              interface{}        `bson:"data" json:"data" validate:"required"` // Stores any type of object (like `Object` in Mongoose)
}
