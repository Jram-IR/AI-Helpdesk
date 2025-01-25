package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func CheckAuth(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Auth header missing or invalid"})
		c.Abort()
		return
	}
	fmt.Println(tokenString)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("error in the signing method used %v", token.Header["alg"])
		}

		return []byte(os.Getenv("SECRET")), nil
	})
	if err != nil {
		c.String(http.StatusUnauthorized, "Invalid cred/timeout login again")
		c.Abort()
		return
	}

	//get the claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		desig, ok := claims["desig"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Designation"})
			c.Abort()
			return
		}

		path := c.FullPath()
		if (desig != "admin" && strings.HasPrefix(path, "/admin")) || (desig != "user" && strings.HasPrefix(path, "/user")) {
			c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized access!"})
			c.Abort()
			return
		}

		c.Next()

	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
	}
}
