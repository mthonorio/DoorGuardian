# 🚪 DoorGuardian

Uma **Campainha Inteligente** desenvolvida com React Native e Expo que transforma sua entrada em um sistema de segurança moderno e conectado.

## 📱 Sobre o Projeto

O **DoorGuardian** é um aplicativo mobile que funciona em conjunto com um módulo **ESP32-CAM** para criar um sistema completo de monitoramento de entrada. O app oferece visualização em tempo real das imagens capturadas pela câmera e mantém um histórico completo de todos os acessos.

## ✨ Principais Funcionalidades

### 📸 **Captura e Exibição de Imagens**

- Recepção em tempo real de imagens da ESP32-CAM
- Visualização instantânea no aplicativo
- Interface intuitiva e responsiva

### 📋 **Histórico de Acessos**

- Registro automático de todos os acessos
- Armazenamento de imagens com timestamp
- Navegação fácil pelo histórico
- Filtros e busca por data/hora

## 🛠️ Tecnologias Utilizadas

### Mobile App

- **React Native** `0.81.4` - Framework principal
- **Expo** `~54.0.0` - Plataforma de desenvolvimento
- **Expo Router** - Sistema de navegação
- **TypeScript** - Tipagem estática
- **NativeWind** - Estilização com Tailwind CSS
- **Zustand** - Gerenciamento de estado

### Hardware

- **ESP32-CAM** - Módulo de câmera IoT
- **WiFi** - Comunicação sem fio

## 📋 Pré-requisitos

- **Node.js** (versão 20.19.4 ou superior)
- **npm** ou **yarn**
- **@expo/cli** (será instalado automaticamente)
- **Android Studio** (para desenvolvimento Android) ou **Xcode** (para iOS)
- Dispositivo físico ou emulador para testes
- **Expo Go** app no dispositivo móvel (para testes rápidos)
- **ESP32-CAM** e **Arduino IDE** (para hardware)

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/mthonorio/DoorGuardian.git
cd DoorGuardian
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
EXPO_PUBLIC_API_URL=http://SEU_SERVIDOR:3000
EXPO_PUBLIC_ESP32_IP=192.168.0.8
```

### 4. Configure o ambiente de desenvolvimento

```bash
# Verifique se tem a versão correta do Node.js (20.19.4+)
node --version

# Se não tiver, instale usando nvm (recomendado):
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# nvm install 20.19.4
# nvm use 20.19.4
# nvm alias default 20.19.4

# Verifique a instalação do Expo
npx expo --version
```

### 4. Configure a ESP32-CAM (Hardware)

📖 **[Ver guia completo de configuração da ESP32-CAM](ESP32-SETUP.md)**

**Resumo rápido:**

1. Instale o Arduino IDE
2. Configure as bibliotecas ESP32
3. Carregue o código `esp32-cam-code.cpp` na ESP32-CAM
4. Configure seu WiFi no código
5. Anote o IP da ESP32-CAM
6. Atualize o IP no arquivo `components/CameraStream.tsx`

```tsx
// No arquivo components/CameraStream.tsx
esp32Ip = '192.168.0.8'; // ← Substitua pelo IP da sua ESP32-CAM
```

### 5. Inicie o aplicativo

```bash
# Entre na pasta do projeto
cd DoorGuardian

# Instale as dependências
yarn install

# Inicie o servidor de desenvolvimento
npx expo start
```

### 6. Teste a integração

1. **Camera Stream**: Verifique se a imagem da ESP32-CAM aparece no app
2. **Controles da Porta**: Teste os botões de abrir/fechar porta
3. **Status**: Monitore a conexão com a ESP32-CAM
4. **Captura de Foto**: Use o botão para tirar fotos pelo app

> **Nota**: A ESP32-CAM deve estar ligada e conectada à mesma rede WiFi do seu dispositivo móvel para funcionar corretamente.

## 📁 Estrutura do Projeto

```
DoorGuardian/
├── app/                    # Telas principais (Expo Router)
│   ├── (tabs)/            # Navegação por abas
│   │   ├── index.tsx      # Tela principal/live view
│   │   └── two.tsx        # Histórico de acessos
│   ├── _layout.tsx        # Layout base
│   └── modal.tsx          # Modais do sistema
├── components/            # Componentes reutilizáveis
│   ├── nativewindui/     # Componentes UI personalizados
│   ├── BackButton.tsx
│   ├── Button.tsx
│   └── ...
├── lib/                   # Utilitários e hooks
├── store/                 # Gerenciamento de estado (Zustand)
├── theme/                 # Configurações de tema
├── assets/                # Imagens e recursos estáticos
└── android/               # Configurações específicas do Android
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start          # Inicia o Expo Dev Server
npm run android    # Executa no Android
npm run ios        # Executa no iOS
npm run web        # Executa na web

# Código
npm run lint       # Verifica o código com ESLint e Prettier
npm run format     # Formata o código automaticamente
```

## 🌐 Configuração da ESP32-CAM

### Hardware Necessário

- Módulo ESP32-CAM
- Jumpers de conexão
- Fonte de alimentação 5V

### Software

1. Configure o Arduino IDE com as bibliotecas ESP32
2. Instale as bibliotecas necessárias:
   - WiFi.h
   - esp_camera.h
   - WebServer.h

### Exemplo de código básico para ESP32-CAM

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "SEU_WIFI";
const char* password = "SUA_SENHA";

WebServer server(80);

void setup() {
  // Configuração da câmera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  // ... outras configurações

  esp_camera_init(&config);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }

  server.on("/capture", handleCapture);
  server.begin();
}

void handleCapture() {
  camera_fb_t * fb = esp_camera_fb_get();
  if(fb) {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);
    esp_camera_fb_return(fb);
  }
}
```

## 🌐 API Backend

O aplicativo se conecta a uma API backend para salvar e recuperar o histórico de capturas. A API deve implementar o seguinte endpoint:

### Endpoints da API

#### `GET /api/v1/history`

Retorna o histórico de registros de acesso.

**Response:**

```json
{
  "access_records": [
    {
      "access": true,
      "date": "2025-09-28T05:36:04.811000Z",
      "id": "11471100-b297-441c-9d12-2d56b5f432a8",
      "image_id": "0c07ef04-f88b-416d-8d3d-ec967e7f8cbd",
      "image_url": "https://example.supabase.co/storage/v1/object/public/images/access_images/image.png",
      "created_at": "2025-09-28T05:09:46.016405Z",
      "updated_at": "2025-09-28T05:09:46.016410Z",
      "image": {
        "filename": "image.png",
        "original_filename": "Generated Image.png",
        "file_size": 1916566,
        "mime_type": "image/png",
        "id": "0c07ef04-f88b-416d-8d3d-ec967e7f8cbd",
        "file_path": "access_images/image.png",
        "created_at": "2025-09-28T05:09:45.415933Z",
        "updated_at": "2025-09-28T05:09:45.415933Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "pages": 1,
    "has_next": false,
    "has_prev": false,
    "next_num": null,
    "prev_num": null
  }
}
```

**Campos importantes:**

- `access`: Indica se o acesso foi permitido (true) ou negado (false)
- `date`: Data/hora do registro de acesso em ISO 8601
- `image_url`: URL da imagem capturada no momento do acesso
- `image.original_filename`: Nome original da imagem
- `pagination`: Informações de paginação para navegar pelos registros

### Configuração da API

1. Configure a variável de ambiente `EXPO_PUBLIC_API_URL` no arquivo `.env`
2. A API deve aceitar requisições CORS para o domínio do app
3. As imagens devem estar acessíveis publicamente ou com autenticação adequada

### Fallback para Desenvolvimento

Se a API não estiver disponível, o app exibirá dados mock para facilitar o desenvolvimento e testes da interface.

## 📱 Funcionalidades Planejadas

### Live View

- Stream de vídeo em tempo real da ESP32-CAM
- Botão de captura manual
- Indicadores de status de conexão
- Interface otimizada para diferentes tamanhos de tela

### Histórico de Acessos

- Lista cronológica de todas as capturas
- Miniaturas das imagens
- Data e hora de cada acesso
- Visualização em tela cheia
- Opção de compartilhamento
- Filtros por período

## 🎨 Interface do Usuário

- **Design Moderno**: Interface limpa e intuitiva
- **Dark/Light Mode**: Suporte automático aos temas do sistema
- **Responsivo**: Otimizado para diferentes tamanhos de tela
- **Acessibilidade**: Seguindo as melhores práticas de UX

## 🔒 Segurança

- Comunicação criptografada com a ESP32-CAM
- Armazenamento local seguro das imagens
- Autenticação por biometria (planejado)
- Logs de acesso e atividades

## 📈 Roadmap Futuro

- [ ] Notificações push em tempo real
- [ ] Reconhecimento facial
- [ ] Integração com assistentes virtuais
- [ ] Backup na nuvem
- [ ] Múltiplas câmeras
- [ ] Controle de acesso inteligente

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvedores

**Matheus Honório** - [@mthonorio](https://github.com/mthonorio)

**Victoria Monteiro** - [@Vmp309](https://github.com/Vmp309)

**Rayque Alencar** - [@rayque-alencar](https://github.com/rayque-alencar)

## 📞 Suporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/mthonorio/DoorGuardian/issues)
- 📧 **Email**: seu.email@exemplo.com
- 💬 **Discussões**: [GitHub Discussions](https://github.com/mthonorio/DoorGuardian/discussions)

---

<div align="center">
  <p>Feito com ❤️ e React Native</p>
  <p>🚪 Transformando entradas em portais inteligentes</p>
</div>
