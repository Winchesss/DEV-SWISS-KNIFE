package handlers

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"dev-swiss-knife/models"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"strings"
	"unicode"
)

func CaesarCipher(c *gin.Context) {
	var req models.CaesarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	if req.Action != "encrypt" && req.Action != "decrypt" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "action must be encrypt or decrypt"})
		return
	}

	shift := req.Shift % 26
	if req.Action == "decrypt" {
		shift = -shift
	}

	var result strings.Builder
	for _, r := range req.Text {
		if unicode.IsLetter(r) {
			base := 'A'
			if unicode.IsLower(r) {
				base = 'a'
			}
			newChar := (int(r-base) + shift) % 26
			if newChar < 0 {
				newChar += 26
			}
			result.WriteRune(rune(newChar) + base)
		} else {
			result.WriteRune(r)
		}
	}

	c.JSON(http.StatusOK, models.CaesarResponse{Result: result.String()})
}

func VigenereCipher(c *gin.Context) {
	var req models.VigenereRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	if req.Action != "encrypt" && req.Action != "decrypt" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "action must be encrypt or decrypt"})
		return
	}

	if req.Keyword == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "keyword cannot be empty"})
		return
	}

	kw := strings.ToUpper(req.Keyword)
	for _, r := range kw {
		if r < 'A' || r > 'Z' {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "keyword must contain only alphabetic characters"})
			return
		}
	}

	var result strings.Builder
	kwIdx := 0
	for _, r := range req.Text {
		if unicode.IsLetter(r) {
			base := 'A'
			if unicode.IsLower(r) {
				base = 'a'
			}
			shift := int(kw[kwIdx%len(kw)] - 'A')
			if req.Action == "decrypt" {
				shift = -shift
			}

			newChar := (int(r-base) + shift) % 26
			if newChar < 0 {
				newChar += 26
			}
			result.WriteRune(rune(newChar) + base)
			kwIdx++
		} else {
			result.WriteRune(r)
		}
	}

	c.JSON(http.StatusOK, models.VigenereResponse{Result: result.String()})
}

func XORCipher(c *gin.Context) {
	var req models.XORRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	if req.Action != "encrypt" && req.Action != "decrypt" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "action must be encrypt or decrypt"})
		return
	}

	if req.Key == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "key cannot be empty"})
		return
	}

	keyBytes := []byte(req.Key)
	var textBytes []byte
	var err error

	if req.Action == "decrypt" {
		textBytes, err = hex.DecodeString(req.Text)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid hex encoding for decryption"})
			return
		}
	} else {
		textBytes = []byte(req.Text)
	}

	resultBytes := make([]byte, len(textBytes))
	for i := 0; i < len(textBytes); i++ {
		resultBytes[i] = textBytes[i] ^ keyBytes[i%len(keyBytes)]
	}

	var result string
	if req.Action == "encrypt" {
		result = hex.EncodeToString(resultBytes)
	} else {
		result = string(resultBytes)
	}

	c.JSON(http.StatusOK, models.XORResponse{Result: result})
}

func Base64Encode(c *gin.Context) {
	var req models.Base64Request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	action := req.Action
	if action == "encrypt" {
		action = "encode"
	} else if action == "decrypt" {
		action = "decode"
	}

	var result string
	if action == "encode" {
		result = base64.StdEncoding.EncodeToString([]byte(req.Text))
	} else if action == "decode" {
		decoded, err := base64.StdEncoding.DecodeString(req.Text)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid base64 string"})
			return
		}
		result = string(decoded)
	} else {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "action must be encode or decode"})
		return
	}

	c.JSON(http.StatusOK, models.Base64Response{Result: result})
}

func pkcs7Pad(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padtext := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(data, padtext...)
}

func pkcs7Unpad(data []byte) ([]byte, error) {
	length := len(data)
	if length == 0 {
		return nil, fmt.Errorf("empty data")
	}
	unpadding := int(data[length-1])
	if unpadding > length || unpadding == 0 {
		return nil, fmt.Errorf("invalid padding")
	}
	for i := length - unpadding; i < length; i++ {
		if int(data[i]) != unpadding {
			return nil, fmt.Errorf("invalid padding")
		}
	}
	return data[:(length - unpadding)], nil
}

func AESEncrypt(c *gin.Context) {
	var req models.AESRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	keyHash := sha256.Sum256([]byte(req.Passphrase))
	key := keyHash[:]

	block, err := aes.NewCipher(key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "failed to create cipher"})
		return
	}

	if req.Action == "encrypt" {
		plaintext := []byte(req.Text)
		plaintext = pkcs7Pad(plaintext, aes.BlockSize)

		ciphertext := make([]byte, len(plaintext))
		iv := make([]byte, aes.BlockSize)
		if _, err := io.ReadFull(rand.Reader, iv); err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "failed to generate IV"})
			return
		}

		mode := cipher.NewCBCEncrypter(block, iv)
		mode.CryptBlocks(ciphertext, plaintext)

		c.JSON(http.StatusOK, models.AESResponse{
			Result: base64.StdEncoding.EncodeToString(ciphertext),
			IV:     hex.EncodeToString(iv),
		})
	} else if req.Action == "decrypt" {
		if req.IV == "" {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "iv required for decryption"})
			return
		}

		iv, err := hex.DecodeString(req.IV)
		if err != nil || len(iv) != aes.BlockSize {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid IV"})
			return
		}

		ciphertext, err := base64.StdEncoding.DecodeString(req.Text)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid ciphertext base64"})
			return
		}

		if len(ciphertext)%aes.BlockSize != 0 {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "ciphertext is not a multiple of the block size"})
			return
		}

		if len(ciphertext) == 0 {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "empty ciphertext"})
			return
		}

		mode := cipher.NewCBCDecrypter(block, iv)
		plaintext := make([]byte, len(ciphertext))
		mode.CryptBlocks(plaintext, ciphertext)

		plaintext, err = pkcs7Unpad(plaintext)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid padding"})
			return
		}

		c.JSON(http.StatusOK, models.AESResponse{Result: string(plaintext)})
	} else {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "action must be encrypt or decrypt"})
	}
}
