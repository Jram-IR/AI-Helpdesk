package controllers

import (
	"net/http"

	config "github.com/Jram-IR/ai_helpdesk_server/Config"
	models "github.com/Jram-IR/ai_helpdesk_server/Models"
	"github.com/Jram-IR/ai_helpdesk_server/service"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func RegisterUser(c *gin.Context) {
	var userData models.User
	if err := c.Bind(&userData); err != nil {
		c.String(http.StatusBadRequest, "could not process post body")
		return
	}
	hash, err := service.GethashPassword(c, false, &userData)
	if err != nil {
		c.String(http.StatusBadRequest, "error in hashing the password")
		return
	}

	user := models.User{Email: userData.Email, Uname: userData.Uname, Password: hash, ThreadsInDepts: []string{}}
	e := service.RegisterEntityDB(config.UserCollection, user)
	if e != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "user registered successfully",
	})
	c.Status(http.StatusOK)
}

func RegisterAdmin(c *gin.Context) {
	var adminData models.Admin
	if err := c.Bind(&adminData); err != nil {
		c.String(http.StatusBadRequest, "could not process post body")
		return
	}

	hash, err := service.GethashPassword(c, true, &adminData)

	if err != nil {
		c.String(http.StatusBadRequest, "error in hashing the password")
		return
	}
	admin := models.Admin{Email: adminData.Email, Name: adminData.Name, Password: string(hash), Dept: adminData.Dept}
	e := service.RegisterEntityDB(config.AdminCollection, admin)
	if e != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert admin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "admin registered successfully",
	})
	c.Status(http.StatusOK)
}

func LoginUser(c *gin.Context) {
	var userData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.Bind(&userData); err != nil {
		c.String(http.StatusBadRequest, "could not process post body")
		return
	}
	fetchedUser, e := service.FetchEntity[models.User](config.UserCollection, bson.M{"email": userData.Email})
	if e != nil {
		c.String(http.StatusInternalServerError, e.Error())
		return
	}

	tokenString, tokenErr := service.GetJWTString(fetchedUser, userData.Password, "")
	if tokenErr != nil {
		c.String(http.StatusBadRequest, tokenErr.Error())
		return
	}
	var response struct {
		JWT string
	}
	response.JWT = tokenString

	c.IndentedJSON(http.StatusOK, response)
}

func LoginAdmin(c *gin.Context) {
	var adminData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Dept     string `json:"dept" binding:"required,min=1"`
	}
	if err := c.Bind(&adminData); err != nil {
		c.String(http.StatusBadRequest, "could not process post body")
		return
	}
	fetchedAdmin, e := service.FetchEntity[models.Admin](config.AdminCollection, bson.M{"email": adminData.Email})
	if e != nil {
		c.String(http.StatusInternalServerError, e.Error())
		return
	}

	tokenString, tokenErr := service.GetJWTString(fetchedAdmin, adminData.Password, adminData.Dept)
	if tokenErr != nil {
		c.String(http.StatusBadRequest, tokenErr.Error())
		return
	}
	var response struct {
		JWT string
	}
	response.JWT = tokenString

	c.IndentedJSON(http.StatusOK, response)

}

func Validate(c *gin.Context) {
	c.String(http.StatusOK, "Validated !")
}
