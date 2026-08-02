import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NumberConvertRequest {
  value: string;
  fromBase: number;
  toBase: number;
}
export interface NumberConvertResponse {
  result: string;
  fromBase: number;
  toBase: number;
}

export interface CharCode {
  char: string;
  decimal: number;
  hex: string;
}
export interface TextToCodesResponse {
  characters: CharCode[];
}
export interface CodesToTextResponse {
  text: string;
}

export interface CryptoResponse {
  result: string;
  iv?: string;
}

export interface FileSizeResponse {
  result: number;
  fromUnit: string;
  toUnit: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  convertNumber(req: NumberConvertRequest): Observable<NumberConvertResponse> {
    return this.http.post<NumberConvertResponse>(`${this.baseUrl}/number/convert`, req);
  }

  textToCodes(text: string): Observable<TextToCodesResponse> {
    return this.http.post<TextToCodesResponse>(`${this.baseUrl}/ascii/text-to-codes`, { text });
  }

  codesToText(codes: number[]): Observable<CodesToTextResponse> {
    return this.http.post<CodesToTextResponse>(`${this.baseUrl}/ascii/codes-to-text`, { codes });
  }

  caesarCipher(text: string, shift: number, action: string): Observable<CryptoResponse> {
    return this.http.post<CryptoResponse>(`${this.baseUrl}/crypto/caesar`, { text, shift, action });
  }

  vigenereCipher(text: string, keyword: string, action: string): Observable<CryptoResponse> {
    return this.http.post<CryptoResponse>(`${this.baseUrl}/crypto/vigenere`, { text, keyword, action });
  }

  xorCipher(text: string, key: string, action: string): Observable<CryptoResponse> {
    return this.http.post<CryptoResponse>(`${this.baseUrl}/crypto/xor`, { text, key, action });
  }

  base64(text: string, action: string): Observable<CryptoResponse> {
    return this.http.post<CryptoResponse>(`${this.baseUrl}/crypto/base64`, { text, action });
  }

  aes(text: string, passphrase: string, action: string, iv?: string): Observable<CryptoResponse> {
    return this.http.post<CryptoResponse>(`${this.baseUrl}/crypto/aes`, { text, passphrase, action, iv });
  }

  convertFileSize(value: number, fromUnit: string, toUnit: string): Observable<FileSizeResponse> {
    return this.http.post<FileSizeResponse>(`${this.baseUrl}/filesize/convert`, { value, fromUnit, toUnit });
  }
}
