package handlers

import (
	"dev-swiss-knife/models"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"strings"
)

func ConvertNumber(c *gin.Context) {
	var req models.NumberConvertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	if req.FromBase < 2 || req.FromBase > 36 || req.ToBase < 2 || req.ToBase > 36 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "base must be between 2 and 36"})
		return
	}

	parsed, err := strconv.ParseInt(req.Value, req.FromBase, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid value for fromBase"})
		return
	}

	result := strconv.FormatInt(parsed, req.ToBase)
	if req.ToBase > 10 {
		result = strings.ToUpper(result)
	}

	c.JSON(http.StatusOK, models.NumberConvertResponse{
		Result:   result,
		FromBase: req.FromBase,
		ToBase:   req.ToBase,
	})
}
