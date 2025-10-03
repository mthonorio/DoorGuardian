import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import WebView from 'react-native-webview';

interface CameraStreamProps {
  esp32Ip?: string;
  isDark?: boolean;
  onStatusChange?: (connected: boolean) => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  esp32Ip = '192.168.0.8',
  isDark = false,
  onStatusChange,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = useRef<WebView>(null);
  const retryCountRef = useRef(0);

  const streamUrl = `http://${esp32Ip}/stream`;
  const statusUrl = `http://${esp32Ip}/`;

  const checkCameraStatus = useCallback(async () => {
    try {
      const response = await fetch(statusUrl, {
        method: 'GET',
      });

      if (response.status === 200) {
        setIsConnected(true);
        onStatusChange?.(true);
        retryCountRef.current = 0;
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      console.log('Erro ao conectar:', error);
      setIsConnected(false);
      onStatusChange?.(false);
    }
  }, [statusUrl, onStatusChange]);

  const forceReloadWebView = () => {
    setWebViewKey((prev) => prev + 1);
    setIsLoading(true);
  };

  const capturePhoto = async () => {
    if (!isConnected) {
      Alert.alert('Erro', 'Câmera não conectada');
      return;
    }

    try {
      const response = await fetch(`http://${esp32Ip}/capture`);
      if (response.ok) {
        Alert.alert('Sucesso', 'Foto capturada!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao capturar foto');
    }
  };

  // Recarrega o WebView periodicamente para evitar travamento
  useEffect(() => {
    if (isConnected) {
      const reloadInterval = setInterval(() => {
        if (retryCountRef.current < 3) {
          // Máximo 3 tentativas
          forceReloadWebView();
          retryCountRef.current += 1;
        }
      }, 30000); // Recarrega a cada 30 segundos

      return () => clearInterval(reloadInterval);
    }
  }, [isConnected]);

  useEffect(() => {
    checkCameraStatus();
    const interval = setInterval(checkCameraStatus, 10000);
    return () => clearInterval(interval);
  }, [checkCameraStatus]);

  if (!isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <View style={styles.disconnectedContainer}>
          <Text style={styles.disconnectedText}>📷 Câmera Desconectada</Text>
          <Text style={styles.disconnectedSubtext}>
            Verifique:{'\n'}• ESP32-CAM ligada{'\n'}• Mesma rede WiFi{'\n'}• IP: {esp32Ip}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={checkCameraStatus}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  body { 
                    background: #000000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                    font-family: Arial, sans-serif;
                  }
                  .container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                  }
                  img { 
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  }
                  .status {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 10px;
                    font-size: 12px;
                  }
                  .error {
                    color: white;
                    text-align: center;
                    padding: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <img src="${streamUrl}" 
                       id="streamImage"
                       onload="document.getElementById('status').textContent='Stream: Conectado'; console.log('Stream carregado');"
                       onerror="document.getElementById('status').textContent='Stream: Erro'; console.log('Erro no stream'); setTimeout(() => { document.getElementById('streamImage').src='${streamUrl}?t=' + Date.now(); }, 1000);"
                       alt="ESP32-CAM Stream" />
                  <div id="status" class="status">Stream: Conectando...</div>
                </div>
                <script>
                  // Monitora e mantém o stream ativo
                  setInterval(function() {
                    var img = document.getElementById('streamImage');
                    var currentSrc = img.src;
                    
                    // Remove parâmetros anteriores e adiciona novo timestamp
                    var baseSrc = currentSrc.split('?')[0];
                    img.src = baseSrc + '?t=' + Date.now();
                    
                    console.log('Stream atualizado:', baseSrc);
                  }, 5000); // Atualiza a cada 5 segundos

                  // Verifica se a imagem ainda está carregando
                  setInterval(function() {
                    var img = document.getElementById('streamImage');
                    if (img.complete && img.naturalHeight === 0) {
                      console.log('Imagem corrompida, recarregando...');
                      img.src = '${streamUrl}?t=' + Date.now();
                    }
                  }, 3000);
                </script>
              </body>
            </html>
          `,
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadStart={() => {
          console.log('WebView iniciando carregamento...');
          setIsLoading(true);
        }}
        onLoadEnd={() => {
          console.log('WebView carregado');
          setIsLoading(false);
          retryCountRef.current = 0;
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView error:', nativeEvent);
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView HTTP error:', nativeEvent);
        }}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Conectando à câmera...</Text>
          </View>
        )}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Carregando stream...</Text>
        </View>
      )}

      {/* Controles */}
      <View style={styles.controlsOverlay}>
        <TouchableOpacity style={styles.reloadButton} onPress={forceReloadWebView}>
          <Text style={styles.captureButtonText}>🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
          <Text style={styles.captureButtonText}>📸</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
        <Text style={styles.statusText}>Conectado</Text>
      </View>

      {/* Informações */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>ESP32-CAM: {esp32Ip}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 300,
    backgroundColor: 'black',
  },
  webview: {
    flex: 1,
    backgroundColor: 'black',
  },
  disconnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  disconnectedText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  disconnectedSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  statusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
