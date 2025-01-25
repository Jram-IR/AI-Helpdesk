package service

import (
	"os"
	"time"

	models "github.com/Jram-IR/ai_helpdesk_server/Models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthenticationInt interface {
	GetPassword() string
	GetEmail() string
	GetName() string
	GetThreadsByDept() []string
}

func GethashPassword(c *gin.Context, isAdmin bool, entity any) (string, error) {
	var data AuthenticationInt
	if isAdmin {
		admin, _ := entity.(*models.Admin)
		data = admin
	} else {
		user, _ := entity.(*models.User)
		data = user
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(data.GetPassword()), 10)
	if err != nil {
		return "", err
	}
	return string(hash), nil

}

func GetJWTString(entity interface{}, password string, dept string) (string, error) {
	var data AuthenticationInt
	var desig string

	if dept == "" {
		user, _ := entity.(*models.User)
		desig = "user"
		data = user
	} else {
		admin, _ := entity.(*models.Admin)
		desig = "admin"
		data = admin
	}
	err := bcrypt.CompareHashAndPassword([]byte(data.GetPassword()), []byte(password))
	if err != nil {
		return "", err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":         data.GetEmail(),
		"name":          data.GetName(),
		"desig":         desig,
		"exp":           time.Now().Add(time.Hour * 24).Unix(),
		"dept":          dept,
		"threadsInDept": data.GetThreadsByDept(),
	})
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
