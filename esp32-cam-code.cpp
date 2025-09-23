#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <WiFiClient.h>

// Configurações de WiFi
const char* ssid = "SEU_WIFI_AQUI";
const char* password = "SUA_SENHA_AQUI";

// Configurações da câmera (ESP32-CAM AI-Thinker)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

WebServer server(80);

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // Configuração da câmera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Configurações de qualidade baseadas na RAM disponível
  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // Inicialização da câmera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Falha na inicialização da câmera: 0x%x", err);
    return;
  }

  // Configuração do sensor
  sensor_t * s = esp_camera_sensor_get();
  s->set_brightness(s, 0);     // -2 a 2
  s->set_contrast(s, 0);       // -2 a 2
  s->set_saturation(s, 0);     // -2 a 2
  s->set_special_effect(s, 0); // 0 a 6 (0-Normal)
  s->set_whitebal(s, 1);       // 0 = desabilitar, 1 = habilitar
  s->set_awb_gain(s, 1);       // 0 = desabilitar, 1 = habilitar
  s->set_wb_mode(s, 0);        // 0 a 4 - se awb_gain habilitado (0 - Auto, 1 - Sunny, 2 - Cloudy, 3 - Office, 4 - Home)
  s->set_exposure_ctrl(s, 1);  // 0 = desabilitar, 1 = habilitar
  s->set_aec2(s, 0);           // 0 = desabilitar, 1 = habilitar
  s->set_ae_level(s, 0);       // -2 a 2
  s->set_aec_value(s, 300);    // 0 a 1200
  s->set_gain_ctrl(s, 1);      // 0 = desabilitar, 1 = habilitar
  s->set_agc_gain(s, 0);       // 0 a 30
  s->set_gainceiling(s, (gainceiling_t)0);  // 0 a 6
  s->set_bpc(s, 0);            // 0 = desabilitar, 1 = habilitar
  s->set_wpc(s, 1);            // 0 = desabilitar, 1 = habilitar
  s->set_raw_gma(s, 1);        // 0 = desabilitar, 1 = habilitar
  s->set_lenc(s, 1);           // 0 = desabilitar, 1 = habilitar
  s->set_hmirror(s, 0);        // 0 = desabilitar, 1 = habilitar
  s->set_vflip(s, 0);          // 0 = desabilitar, 1 = habilitar
  s->set_dcw(s, 1);            // 0 = desabilitar, 1 = habilitar
  s->set_colorbar(s, 0);       // 0 = desabilitar, 1 = habilitar

  // Conexão WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.print("Endereço IP da câmera: ");
  Serial.println(WiFi.localIP());

  // Configuração dos endpoints
  server.on("/", HTTP_GET, handleRoot);
  server.on("/capture", HTTP_GET, handleCapture);
  server.on("/stream", HTTP_GET, handleStream);
  server.on("/status", HTTP_GET, handleStatus);
  
  // Headers CORS para permitir acesso do React Native
  server.enableCORS(true);
  
  server.begin();
  Serial.println("Servidor iniciado");
}

void loop() {
  server.handleClient();
}

// Página inicial
void handleRoot() {
  String html = "<html><body><h1>ESP32-CAM DoorGuardian</h1>";
  html += "<p><a href='/stream'>Ver Stream</a></p>";
  html += "<p><a href='/capture'>Capturar Foto</a></p>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

// Captura uma foto
void handleCapture() {
  camera_fb_t * fb = esp_camera_fb_get();
  if(!fb) {
    Serial.println("Falha na captura da câmera");
    server.send(500, "text/plain", "Falha na captura da câmera");
    return;
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);
  
  esp_camera_fb_return(fb);
}

// Stream de vídeo
void handleStream() {
  WiFiClient client = server.client();
  
  String response = "HTTP/1.1 200 OK\r\n";
  response += "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n";
  server.sendContent(response);
  
  while(client.connected()) {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Falha na captura do frame");
      break;
    }
    
    client.print("--frame\r\n");
    client.print("Content-Type: image/jpeg\r\n");
    client.print("Content-Length: " + String(fb->len) + "\r\n\r\n");
    client.write(fb->buf, fb->len);
    client.print("\r\n");
    
    esp_camera_fb_return(fb);
    
    if(!client.connected()) break;
  }
}

// Status da câmera
void handleStatus() {
  String status = "{\"status\":\"connected\",\"ip\":\"" + WiFi.localIP().toString() + "\"}";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200, "application/json", status);
}