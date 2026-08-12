package main

import (
	"log"

	"test/handler"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	prometheusHandler, err := handler.NewPrometheusHandler("http://192.168.1.21:9090")
	if err != nil {
		log.Fatal(err)
	}

	r.GET("/proxy/thanos/matrix", prometheusHandler.Matrix)
	r.GET("/proxy/test", prometheusHandler.Test)
	r.GET("/proxy/test2", prometheusHandler.Test2)

	r.Run(":9090")
}
