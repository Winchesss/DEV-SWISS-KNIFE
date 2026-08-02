package models

// Number converter
type NumberConvertRequest struct {
	Value    string `json:"value" binding:"required"`
	FromBase int    `json:"fromBase" binding:"required"`
	ToBase   int    `json:"toBase" binding:"required"`
}
type NumberConvertResponse struct {
	Result   string `json:"result"`
	FromBase int    `json:"fromBase"`
	ToBase   int    `json:"toBase"`
}

// ASCII inspector
type TextToCodesRequest struct {
	Text string `json:"text" binding:"required"`
}
type CharCode struct {
	Char    string `json:"char"`
	Decimal int    `json:"decimal"`
	Hex     string `json:"hex"`
}
type TextToCodesResponse struct {
	Characters []CharCode `json:"characters"`
}
type CodesToTextRequest struct {
	Codes []int `json:"codes" binding:"required"`
}
type CodesToTextResponse struct {
	Text string `json:"text"`
}

// Crypto
type CaesarRequest struct {
	Text   string `json:"text" binding:"required"`
	Shift  int    `json:"shift"`
	Action string `json:"action" binding:"required"` // encrypt or decrypt
}
type CaesarResponse struct {
	Result string `json:"result"`
}
type VigenereRequest struct {
	Text    string `json:"text" binding:"required"`
	Keyword string `json:"keyword" binding:"required"`
	Action  string `json:"action" binding:"required"`
}
type VigenereResponse struct {
	Result string `json:"result"`
}
type XORRequest struct {
	Text   string `json:"text" binding:"required"`
	Key    string `json:"key" binding:"required"`
	Action string `json:"action" binding:"required"`
}
type XORResponse struct {
	Result string `json:"result"`
}
type Base64Request struct {
	Text   string `json:"text" binding:"required"`
	Action string `json:"action" binding:"required"` // encode or decode
}
type Base64Response struct {
	Result string `json:"result"`
}
type AESRequest struct {
	Text       string `json:"text" binding:"required"`
	Passphrase string `json:"passphrase" binding:"required"`
	Action     string `json:"action" binding:"required"` // encrypt or decrypt
	IV         string `json:"iv,omitempty"`               // required for decrypt, hex-encoded
}
type AESResponse struct {
	Result string `json:"result"`
	IV     string `json:"iv,omitempty"` // hex-encoded, returned on encrypt
}

// File size
type FileSizeRequest struct {
	Value    float64 `json:"value" binding:"required"`
	FromUnit string  `json:"fromUnit" binding:"required"`
	ToUnit   string  `json:"toUnit" binding:"required"`
}
type FileSizeResponse struct {
	Result   float64 `json:"result"`
	FromUnit string  `json:"fromUnit"`
	ToUnit   string  `json:"toUnit"`
}

// Generic error
type ErrorResponse struct {
	Error string `json:"error"`
}
