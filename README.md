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

- **React Native** `0.79.5` - Framework principal
- **Expo** `~53.0.6` - Plataforma de desenvolvimento
- **Expo Router** - Sistema de navegação
- **TypeScript** - Tipagem estática
- **NativeWind** - Estilização com Tailwind CSS
- **Zustand** - Gerenciamento de estado

### Hardware

- **ESP32-CAM** - Módulo de câmera IoT
- **WiFi** - Comunicação sem fio

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Expo CLI** instalado globalmente
- **Android Studio** (para desenvolvimento Android) ou **Xcode** (para iOS)
- Dispositivo físico ou emulador para testes

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

### 3. Configure o ambiente de desenvolvimento

```bash
# Instale o Expo CLI se ainda não tiver
npm install -g @expo/cli

# Verifique a instalação
expo --version
```

### 4. Execute o aplicativo

#### Para desenvolvimento

```bash
npm start
# ou
expo start
```

#### Para Android

```bash
npm run android
# ou
expo run:android
```

#### Para iOS

```bash
npm run ios
# ou
expo run:ios
```

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
