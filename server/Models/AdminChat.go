package models

import (
	"time"
)

type ChatItem struct {
	Human  string `bson:"human" json:"human"`
	System string `bson:"system" json:"system"`
}

type AdminConversation struct {
	ID        *string    `bson:"_id,omitempty" json:"_id,omitempty"`
	Chat      []ChatItem `bson:"chat" json:"chat"`
	Email     string     `bson:"email" json:"email"`
	Dept      string     `bson:"dept" json:"dept"`
	Timestamp time.Time  `bson:"timestamp" json:"timestamp"`
}
