package main

import (
	"dev-swiss-knife/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:4200"}
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Content-Type", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		number := api.Group("/number")
		{
			number.POST("/convert", handlers.ConvertNumber)
		}

		ascii := api.Group("/ascii")
		{
			ascii.POST("/text-to-codes", handlers.TextToCodes)
			ascii.POST("/codes-to-text", handlers.CodesToText)
		}

		crypto := api.Group("/crypto")
		{
			crypto.POST("/caesar", handlers.CaesarCipher)
			crypto.POST("/vigenere", handlers.VigenereCipher)
			crypto.POST("/xor", handlers.XORCipher)
			crypto.POST("/base64", handlers.Base64Encode)
			crypto.POST("/aes", handlers.AESEncrypt)
		}

		filesize := api.Group("/filesize")
		{
			filesize.POST("/convert", handlers.ConvertFileSize)
		}
	}

	r.Run(":8080")
}
