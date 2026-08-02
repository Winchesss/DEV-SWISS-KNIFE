package handlers

import (
	"dev-swiss-knife/models"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func TextToCodes(c *gin.Context) {
	var req models.TextToCodesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	var chars []models.CharCode
	for _, r := range req.Text {
		chars = append(chars, models.CharCode{
			Char:    string(r),
			Decimal: int(r),
			Hex:     fmt.Sprintf("%X", r),
		})
	}

	c.JSON(http.StatusOK, models.TextToCodesResponse{Characters: chars})
}

func CodesToText(c *gin.Context) {
	var req models.CodesToTextRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	if len(req.Codes) == 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "codes array cannot be empty"})
		return
	}

	var text string
	for _, code := range req.Codes {
		text += string(rune(code))
	}

	c.JSON(http.StatusOK, models.CodesToTextResponse{Text: text})
}
