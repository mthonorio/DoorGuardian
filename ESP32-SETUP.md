# 🔧 Configuração ESP32-CAM para DoorGuardian

## 📋 **Pré-requisitos**

### Hardware:
- **ESP32-CAM** (AI-Thinker)
- **Cabo USB para programação**
- **Jumpers** para conexão
- **Fonte 5V** (recomendado)

### Software:
- **Arduino IDE** 1.8.x ou superior
- **ESP32 Board Manager**
- **Bibliotecas necessárias**

## 🚀 **Instalação - Passo a Passo**

### **1. Configurar Arduino IDE**

```bash
# 1. Abra o Arduino IDE
# 2. Vá em: Arquivo > Preferências
# 3. Em "URLs Adicionais para Gerenciadores de Placas", adicione:
https://dl.espressif.com/dl/package_esp32_index.json

# 4. Vá em: Ferramentas > Placa > Gerenciador de Placas
# 5. Pesquise por "ESP32" e instale "ESP32 by Espressif Systems"
```

### **2. Configurar Pinagem**

```cpp
// Pinagem para ESP32-CAM AI-Thinker (já configurada no código)
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
```

### **3. Programar ESP32-CAM**

1. **Conecte os jumpers para programação:**
   - `GND` ↔ `IO0` (para entrar no modo de programação)
   - `5V` ↔ `VCC`
   - `GND` ↔ `GND`

2. **Configure o Arduino IDE:**
   - **Placa:** `AI Thinker ESP32-CAM`
   - **Upload Speed:** `115200`
   - **Flash Frequency:** `40MHz`
   - **Flash Mode:** `DIO`
   - **Partition Scheme:** `Huge APP (3MB No OTA/1MB SPIFFS)`

3. **Carregue o código** (`esp32-cam-code.cpp`)

4. **Após upload:**
   - Remova o jumper `GND` ↔ `IO0`
   - Pressione o botão RESET
   - A ESP32-CAM deve inicializar

### **4. Configurar WiFi**

```cpp
// No arquivo esp32-cam-code.cpp, altere essas linhas:
const char* ssid = "SEU_NOME_WIFI_AQUI";        // ← Substitua
const char* password = "SUA_SENHA_WIFI_AQUI";   // ← Substitua
```

### **5. Encontrar IP da ESP32-CAM**

1. **Abra o Monitor Serial** (Ctrl+Shift+M)
2. **Configure para 115200 baud**
3. **Pressione RESET** na ESP32-CAM
4. **Anote o IP** que aparecer (ex: 192.168.1.100)

```
WiFi conectado
Endereço IP da câmera: 192.168.1.100  ← Este é o IP!
Servidor iniciado
```

### **6. Configurar IP no App**

No arquivo `/components/CameraStream.tsx`, altere:

```tsx
esp32Ip="192.168.1.100" // ← Coloque o IP da sua ESP32-CAM aqui
```

Ou na tela principal `/app/(tabs)/index.tsx`:

```tsx
<CameraStream 
  esp32Ip="192.168.1.100" // ← Substitua pelo IP real
  isDark={isDark}
  onStatusChange={setCameraConnected}
/>
```

## 🧪 **Testar Conexão**

### **1. Teste no Navegador:**
- Acesse: `http://SEU_IP_ESP32/`
- Deve aparecer: "ESP32-CAM DoorGuardian"
- Teste o stream: `http://SEU_IP_ESP32/stream`
- Teste captura: `http://SEU_IP_ESP32/capture`

### **2. Teste no App:**
- Inicie o app React Native
- Se conectado, deve aparecer o stream da câmera
- Status deve mostrar "Conectado" em verde

## 📡 **Endpoints Disponíveis**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Página inicial |
| `/stream` | GET | Stream de vídeo ao vivo |
| `/capture` | GET | Captura uma foto |
| `/status` | GET | Status da câmera (JSON) |

## 🔧 **Troubleshooting**

### **ESP32-CAM não conecta no WiFi:**
```cpp
// Adicione debug no código:
Serial.begin(115200);
WiFi.begin(ssid, password);
while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    Serial.println(WiFi.status()); // Debug status
}
```

### **Câmera não inicializa:**
```cpp
// Verifique se PSRAM está disponível:
if(!psramFound()){
    Serial.println("PSRAM não encontrada! Reduza a resolução.");
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
}
```

### **Stream não carrega no app:**
1. **Verifique o IP** da ESP32-CAM
2. **Teste no navegador** primeiro
3. **Verifique a rede WiFi** (mesmo WiFi do celular)
4. **Desative firewall** temporariamente
5. **Reinicie a ESP32-CAM**

### **Erro CORS:**
```cpp
// Já está configurado no código:
server.sendHeader("Access-Control-Allow-Origin", "*");
server.enableCORS(true);
```

## 🎯 **Próximos Passos**

1. ✅ **Configurar ESP32-CAM** (você está aqui)
2. 📱 **Testar stream no app**
3. 🔒 **Adicionar controles de porta** (relé/servo)
4. 📝 **Implementar histórico de capturas**
5. 🔔 **Adicionar notificações push**

## 🆘 **Suporte**

Se tiver problemas, verifique:
- [ ] ESP32-CAM está alimentada (LED vermelho aceso)
- [ ] WiFi configurado corretamente
- [ ] IP correto no app
- [ ] Mesma rede WiFi
- [ ] Código carregado sem erros
- [ ] Monitor Serial mostra IP da câmera

**Dica:** Use um IP fixo no roteador para a ESP32-CAM para evitar mudanças de IP!