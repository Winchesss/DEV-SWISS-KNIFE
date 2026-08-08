package handlers

import (
	"dev-swiss-knife/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func ConvertFileSize(c *gin.Context) {
	var req models.FileSizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	if *req.Value < 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "value cannot be negative"})
		return
	}

	units := map[string]float64{
		"b":   0.125,
		"B":   1.0,
		"KB":  1e3,
		"MB":  1e6,
		"GB":  1e9,
		"TB":  1e12,
		"PB":  1e15,
		"KiB": 1024.0,
		"MiB": 1048576.0,
		"GiB": 1073741824.0,
		"TiB": 1099511627776.0,
		"PiB": 1125899906842624.0,
	}

	fromMult, ok1 := units[req.FromUnit]
	toMult, ok2 := units[req.ToUnit]

	if !ok1 || !ok2 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "unknown unit"})
		return
	}

	result := *req.Value * fromMult / toMult

	c.JSON(http.StatusOK, models.FileSizeResponse{
		Result:   result,
		FromUnit: req.FromUnit,
		ToUnit:   req.ToUnit,
	})
}
