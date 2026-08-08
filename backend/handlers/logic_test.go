package handlers

import (
	"bytes"
	"dev-swiss-knife/models"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func postJSON(handler gin.HandlerFunc, body string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/", handler)

	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")

	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)
	return res
}

func TestBase64Actions(t *testing.T) {
	tests := []struct {
		name   string
		body   string
		result string
	}{
		{
			name:   "encode",
			body:   `{"text":"test","action":"encode"}`,
			result: "dGVzdA==",
		},
		{
			name:   "decode",
			body:   `{"text":"dGVzdA==","action":"decode"}`,
			result: "test",
		},
		{
			name:   "encrypt alias",
			body:   `{"text":"test","action":"encrypt"}`,
			result: "dGVzdA==",
		},
		{
			name:   "decrypt alias",
			body:   `{"text":"dGVzdA==","action":"decrypt"}`,
			result: "test",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			res := postJSON(Base64Encode, tc.body)
			if res.Code != http.StatusOK {
				t.Fatalf("expected status 200, got %d: %s", res.Code, res.Body.String())
			}

			var response models.Base64Response
			if err := json.Unmarshal(res.Body.Bytes(), &response); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}
			if response.Result != tc.result {
				t.Fatalf("expected %q, got %q", tc.result, response.Result)
			}
		})
	}
}

func TestCryptoRejectsInvalidActions(t *testing.T) {
	tests := []struct {
		name    string
		handler gin.HandlerFunc
		body    string
	}{
		{
			name:    "caesar",
			handler: CaesarCipher,
			body:    `{"text":"abc","shift":2,"action":"bogus"}`,
		},
		{
			name:    "vigenere",
			handler: VigenereCipher,
			body:    `{"text":"abc","keyword":"key","action":"bogus"}`,
		},
		{
			name:    "xor",
			handler: XORCipher,
			body:    `{"text":"abc","key":"k","action":"bogus"}`,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			res := postJSON(tc.handler, tc.body)
			if res.Code != http.StatusBadRequest {
				t.Fatalf("expected status 400, got %d: %s", res.Code, res.Body.String())
			}
		})
	}
}

func TestVigenereCipher(t *testing.T) {
	res := postJSON(VigenereCipher, `{"text":"ATTACKATDAWN","keyword":"LEMON","action":"encrypt"}`)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200 for encrypt, got %d: %s", res.Code, res.Body.String())
	}

	var encrypted models.VigenereResponse
	if err := json.Unmarshal(res.Body.Bytes(), &encrypted); err != nil {
		t.Fatalf("failed to decode encrypt response: %v", err)
	}
	if encrypted.Result != "LXFOPVEFRNHR" {
		t.Fatalf("expected LXFOPVEFRNHR, got %q", encrypted.Result)
	}

	res = postJSON(VigenereCipher, `{"text":"LXFOPVEFRNHR","keyword":"LEMON","action":"decrypt"}`)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200 for decrypt, got %d: %s", res.Code, res.Body.String())
	}

	var decrypted models.VigenereResponse
	if err := json.Unmarshal(res.Body.Bytes(), &decrypted); err != nil {
		t.Fatalf("failed to decode decrypt response: %v", err)
	}
	if decrypted.Result != "ATTACKATDAWN" {
		t.Fatalf("expected ATTACKATDAWN, got %q", decrypted.Result)
	}

	res = postJSON(VigenereCipher, `{"text":"abc","keyword":"ż","action":"encrypt"}`)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for non-ASCII keyword, got %d: %s", res.Code, res.Body.String())
	}
}

func TestXORCipher(t *testing.T) {
	res := postJSON(XORCipher, `{"text":"hello","key":"key","action":"encrypt"}`)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200 for encrypt, got %d: %s", res.Code, res.Body.String())
	}

	var encrypted models.XORResponse
	if err := json.Unmarshal(res.Body.Bytes(), &encrypted); err != nil {
		t.Fatalf("failed to decode encrypt response: %v", err)
	}
	if encrypted.Result != "030015070a" {
		t.Fatalf("expected 030015070a, got %q", encrypted.Result)
	}

	res = postJSON(XORCipher, `{"text":"030015070a","key":"key","action":"decrypt"}`)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200 for decrypt, got %d: %s", res.Code, res.Body.String())
	}

	var decrypted models.XORResponse
	if err := json.Unmarshal(res.Body.Bytes(), &decrypted); err != nil {
		t.Fatalf("failed to decode decrypt response: %v", err)
	}
	if decrypted.Result != "hello" {
		t.Fatalf("expected hello, got %q", decrypted.Result)
	}

	res = postJSON(XORCipher, `{"text":"not-hex","key":"key","action":"decrypt"}`)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for invalid decrypt hex, got %d: %s", res.Code, res.Body.String())
	}
}

func TestAESCipher(t *testing.T) {
	res := postJSON(AESEncrypt, `{"text":"secret message","passphrase":"correct horse battery staple","action":"encrypt"}`)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200 for encrypt, got %d: %s", res.Code, res.Body.String())
	}

	var encrypted models.AESResponse
	if err := json.Unmarshal(res.Body.Bytes(), &encrypted); err != nil {
		t.Fatalf("failed to decode encrypt response: %v", err)
	}
	if encrypted.Result == "" || encrypted.IV == "" {
		t.Fatalf("expected ciphertext and IV, got result=%q iv=%q", encrypted.Result, encrypted.IV)
	}

	bodyBytes, err := json.Marshal(map[string]string{
		"text":       encrypted.Result,
		"passphrase": "correct horse battery staple",
		"action":     "decrypt",
		"iv":         encrypted.IV,
	})
	if err != nil {
		t.Fatalf("failed to encode decrypt request: %v", err)
	}

	res = postJSON(AESEncrypt, string(bodyBytes))
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200 for decrypt, got %d: %s", res.Code, res.Body.String())
	}

	var decrypted models.AESResponse
	if err := json.Unmarshal(res.Body.Bytes(), &decrypted); err != nil {
		t.Fatalf("failed to decode decrypt response: %v", err)
	}
	if decrypted.Result != "secret message" {
		t.Fatalf("expected secret message, got %q", decrypted.Result)
	}

	res = postJSON(AESEncrypt, `{"text":"abc","passphrase":"pass","action":"decrypt"}`)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for missing IV, got %d: %s", res.Code, res.Body.String())
	}
}

func TestFileSizeZeroAndInvalidValues(t *testing.T) {
	res := postJSON(ConvertFileSize, `{"value":0,"fromUnit":"B","toUnit":"KB"}`)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200 for zero value, got %d: %s", res.Code, res.Body.String())
	}

	var response models.FileSizeResponse
	if err := json.Unmarshal(res.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if response.Result != 0 {
		t.Fatalf("expected zero result, got %v", response.Result)
	}

	res = postJSON(ConvertFileSize, `{"fromUnit":"B","toUnit":"KB"}`)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for missing value, got %d: %s", res.Code, res.Body.String())
	}

	res = postJSON(ConvertFileSize, `{"value":-1,"fromUnit":"B","toUnit":"KB"}`)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for negative value, got %d: %s", res.Code, res.Body.String())
	}
}

func TestFileSizeConversions(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		expected float64
	}{
		{
			name:     "bits to bytes",
			body:     `{"value":8,"fromUnit":"b","toUnit":"B"}`,
			expected: 1,
		},
		{
			name:     "SI kilobyte to bytes",
			body:     `{"value":1,"fromUnit":"KB","toUnit":"B"}`,
			expected: 1000,
		},
		{
			name:     "IEC mebibyte to kibibytes",
			body:     `{"value":1,"fromUnit":"MiB","toUnit":"KiB"}`,
			expected: 1024,
		},
		{
			name:     "SI megabyte to IEC mebibytes",
			body:     `{"value":1048576,"fromUnit":"B","toUnit":"MiB"}`,
			expected: 1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			res := postJSON(ConvertFileSize, tc.body)
			if res.Code != http.StatusOK {
				t.Fatalf("expected status 200, got %d: %s", res.Code, res.Body.String())
			}

			var response models.FileSizeResponse
			if err := json.Unmarshal(res.Body.Bytes(), &response); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}
			if response.Result != tc.expected {
				t.Fatalf("expected %v, got %v", tc.expected, response.Result)
			}
		})
	}
}
