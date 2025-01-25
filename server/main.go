package main

import (
	"os"
	"time"

	config "github.com/Jram-IR/ai_helpdesk_server/Config"
	controllers "github.com/Jram-IR/ai_helpdesk_server/Controllers"
	middleware "github.com/Jram-IR/ai_helpdesk_server/Middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	config.LoadEnvVariables()
	config.ConnectToDB()

}
func main() {
	router := gin.Default()

	// Enable CORS for all origins
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  true, // Allows all origins
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.POST("/user/signup", controllers.RegisterUser)
	router.POST("/user/login", controllers.LoginUser)
	router.POST("/admin/signup", controllers.RegisterAdmin)
	router.POST("/admin/login", controllers.LoginAdmin)

	router.GET("/admin/validate", middleware.CheckAuth, controllers.Validate)
	router.GET("/user/validate", middleware.CheckAuth, controllers.Validate)

	router.GET("/admin/:dept", middleware.CheckAuth, controllers.CreateDeptHandler)
	router.POST("/allThreads", middleware.CheckAuth, controllers.GetAllThreadsByDeptHandler)
	router.POST("/thread", middleware.CheckAuth, controllers.GetThreadById)

	router.GET("/admin/qa/all/:chatId", middleware.CheckAuth, controllers.GetAdminChatById)
	router.GET("/admin/qa/:email", middleware.CheckAuth, controllers.GetAllAdminChats)
	router.PUT("/newThread/:dept", middleware.CheckAuth, controllers.CreateNewThread)

	router.Run(os.Getenv("PORT"))

}
