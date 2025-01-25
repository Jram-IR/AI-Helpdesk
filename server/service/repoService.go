package service

import (
	"context"
	"fmt"

	config "github.com/Jram-IR/ai_helpdesk_server/Config"
	models "github.com/Jram-IR/ai_helpdesk_server/Models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var ctx context.Context = context.Background()

func RegisterEntityDB(collection *mongo.Collection, entity interface{}) error {
	_, err := collection.InsertOne(ctx, entity)
	if err != nil {
		return err
	}
	return nil
}

func CreateNewThread(collection *mongo.Collection, entity interface{}) error {
	_, err := collection.InsertOne(ctx, entity)
	if err != nil {
		return err
	}
	return nil
}

func FetchEntity[T any](collection *mongo.Collection, filter bson.M) (*T, error) {
	var entity T
	err := collection.FindOne(ctx, filter).Decode(&entity)
	if err != nil {
		return nil, err
	}
	return &entity, nil

}

// func FetchAllThreadsByDept(dept string, email string) (*models.AllThreads, error) {
// 	var allThreads models.AllThreads
// 	projection := bson.M{"_id": 1}
// 	res, err := config.DB.Collection(dept).Find(ctx, bson.M{"details.userEmail": email}, options.Find().SetProjection(projection))
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer res.Close(ctx)

// 	var threadIDs []string
// 	for res.Next(ctx) {
// 		var result struct {
// 			ID string `bson:"_id"`
// 		}
// 		if err := res.Decode(&result); err != nil {
// 			return nil, err
// 		}
// 		threadIDs = append(threadIDs, result.ID)

// 	}
// 	if err := res.Err(); err != nil {
// 		return nil, err
// 	}
// 	allThreads.Thread_id = threadIDs

// 	return &allThreads, nil
// }

func FetchAllThreadsByDept(dept string, email string) ([]map[string]interface{}, error) {
	var conversations []models.Conversation
	// cursor, err := config.DB.Collection(dept).Find(ctx, bson.M{"details.userEmail": email}) //for specifc user
	cursor, err := config.DB.Collection(dept).Find(ctx, bson.M{}) // filter by user email on frontend
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var conversation models.Conversation
		if err := cursor.Decode(&conversation); err != nil {
			return nil, err
		}
		conversations = append(conversations, conversation)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, conversation := range conversations {
		if len(conversation.Thread) > 0 {
			lastIndex := len(conversation.Thread) - 1
			result = append(result, map[string]interface{}{
				"isEscalated": conversation.IsEscalated,
				"title":       conversation.Thread[lastIndex].Question,
				"id":          conversation.ID.Hex(),
				"adminInt":    conversation.AdminInt,
				"userEmail":   conversation.Details.UserEmail,
				"isResolved":  conversation.IsResolved,
				"resolvedBy":  conversation.ResolvedBy,
			})
		}
	}

	return result, nil
}

func FetchThreadById(dept string, id string) (*models.Conversation, error) {
	var conversation models.Conversation
	objectID, e := primitive.ObjectIDFromHex(id)
	if e != nil {
		return nil, fmt.Errorf("invalid id format: %v", e)
	}
	err := config.DB.Collection(dept).FindOne(ctx, bson.M{"_id": objectID}).Decode(&conversation)
	if err != nil {
		return nil, err
	}
	conversation.ID = objectID
	conversation.Details.ThreadID = id
	return &conversation, nil
}

func FetchAllAdminChat(email string) (*[]models.AdminConversation, error) {
	var chats []models.AdminConversation
	res, err := config.AdminQaCollection.Find(ctx, bson.M{"email": email})
	if err != nil {
		return nil, err
	}
	for res.Next(ctx) {
		var conversation models.AdminConversation
		err := res.Decode(&conversation)
		if err != nil {
			return nil, err
		}
		chats = append(chats, conversation)
	}
	if err := res.Err(); err != nil {
		return nil, err
	}
	return &chats, nil

}

func FetchAdminChatById(id string) (*models.AdminConversation, error) {
	var chat models.AdminConversation
	objectID, e := primitive.ObjectIDFromHex(id)
	if e != nil {
		return nil, e
	}
	res := config.AdminQaCollection.FindOne(ctx, bson.M{"_id": objectID})
	err := res.Decode(&chat)
	if err != nil {
		return nil, err
	}
	chat.ID = &id
	return &chat, nil
}
func CreateDept(dept string) error {
	err := config.DB.CreateCollection(ctx, dept)
	if err != nil {
		return fmt.Errorf("error creating collection: %v", err)
	}
	return nil
}
