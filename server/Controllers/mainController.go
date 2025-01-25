package controllers

import (
	"net/http"
	"time"

	config "github.com/Jram-IR/ai_helpdesk_server/Config"
	models "github.com/Jram-IR/ai_helpdesk_server/Models"
	"github.com/Jram-IR/ai_helpdesk_server/service"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetAllThreadsByDeptHandler(c *gin.Context) {
	var req models.AllThreadsReq
	if err := c.Bind(&req); err != nil {
		c.String(http.StatusBadRequest, "could not process post body")
		return
	}
	allThreads, err := service.FetchAllThreadsByDept(req.Dept, req.Email)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.IndentedJSON(http.StatusOK, allThreads)
}

func GetThreadById(c *gin.Context) {
	var req models.ThreadByIdReq
	if err := c.Bind(&req); err != nil {
		c.String(http.StatusBadRequest, "could not process post body")
		return
	}
	thread, err := service.FetchThreadById(req.Dept, req.Id)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.IndentedJSON(http.StatusOK, thread)
}

func GetAllAdminChats(c *gin.Context) {
	email := c.Param("email")
	allChats, err := service.FetchAllAdminChat(email)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	c.IndentedJSON(http.StatusOK, allChats)
}

func GetAdminChatById(c *gin.Context) {
	chatId := c.Param("chatId")
	chat, err := service.FetchAdminChatById(chatId)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	c.IndentedJSON(http.StatusOK, chat)
}

func CreateDeptHandler(c *gin.Context) {
	deptName := c.Param("dept")
	err := service.CreateDept(deptName)
	if err != nil {
		c.String(http.StatusOK, err.Error())
		return
	}
	c.Status(http.StatusCreated)

}

func CreateNewThread(c *gin.Context) {
	deptName := c.Param("dept")
	newConversation := models.Conversation{
		ID:        primitive.NewObjectID(),
		Thread:    []models.ThreadItem{},
		Details:   models.Details{ThreadID: "", Query: "", UserEmail: "", UName: "", Dept: ""},
		Timestamp: time.Now(),
	}

	err := service.RegisterEntityDB(config.DB.Collection(deptName), newConversation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create conversation"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": newConversation.ID.Hex()})
}
