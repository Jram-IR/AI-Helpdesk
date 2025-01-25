package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AllThreadsReq struct {
	Email string `json:"email"`
	Dept  string `json:"dept"`
}
type ThreadByIdReq struct {
	Id   string `json:"id"`
	Dept string `json:"dept"`
}

type ThreadItem struct {
	Question string
	Answer   string
	AnswerBy string
	Email    string
}

type AllThreads struct {
	Thread_id []string `json:"thread_id"`
}

type Details struct {
	ThreadID  string `json:"thread_id"`
	Query     string `json:"query"`
	UserEmail string `json:"userEmail"`
	UName     string `json:"uname"`
	Dept      string `json:"dept"`
}

type Conversation struct {
	ID             primitive.ObjectID `bson:"_id" json:"_id"`
	Thread         []ThreadItem       `bson:"thread" json:"thread"`
	Details        Details            `bson:"details" json:"details"`
	AdminInt       string             `bson:"adminInt" json:"adminInt"`
	EscalatedQuery *string            `bson:"escalated_query,omitempty" json:"escalated_query,omitempty"` // Nullable
	EscalatedQIdx  *[]int             `bson:"escalated_qidx,omitempty" json:"escalated_qidx,omitempty"`   // Nullable
	EscalateTime   *time.Time         `bson:"escalate_time,omitempty" json:"escalate_time,omitempty"`     // Nullable
	IsResolved     bool               `bson:"isResolved" json:"isResolved"`
	IsEscalated    bool               `bson:"isEscalated" json:"isEscalated"`
	ResolvedBy     string             `bson:"resolvedBy,omitempty" json:"resolvedBy,omitempty"` // Optional
	ResolvedAt     *time.Time         `bson:"resolvedAt,omitempty" json:"resolvedAt,omitempty"` // Nullable
	Timestamp      time.Time          `bson:"timestamp" json:"timestamp"`
}
