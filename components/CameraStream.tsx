import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text } from '~/components/nativewindui/Text';

interface CameraStreamProps {
  esp32Ip?: string;
  isDark?: boolean;
  onStatusChange?: (connected: boolean) => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  esp32Ip = '192.168.1.100', // IP padrão - substitua pelo IP da sua ESP32
  isDark = false,
  onStatusChange,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  // URLs dos endpoints
  const endpoints = {
    stream: `http://${esp32Ip}/stream`,
    capture: `http://${esp32Ip}/capture`,
    status: `http://${esp32Ip}/status`,
  };

  // Verificar status da ESP32-CAM
  const checkCameraStatus = useCallback(async () => {
    try {
      const response = await fetch(endpoints.status, {
        method: 'GET',
      });
      
      if (response.ok) {
        await response.json(); // Consumir a resposta
        setIsConnected(true);
        setStreamUrl(endpoints.stream);
        onStatusChange?.(true);
      } else {
        setIsConnected(false);
        setStreamUrl(null);
        onStatusChange?.(false);
      }
    } catch (error) {
      console.log('Erro ao conectar com ESP32-CAM:', error);
      setIsConnected(false);
      setStreamUrl(null);
      onStatusChange?.(false);
    }
  }, [endpoints.status, endpoints.stream, onStatusChange]);

  // Capturar foto individual
  const capturePhoto = async () => {
    if (!isConnected) {
      Alert.alert('Erro', 'ESP32-CAM não está conectada');
      return;
    }

    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const captureUrl = `${endpoints.capture}?t=${timestamp}`;
      setLastCapture(captureUrl);
      
      Alert.alert('Sucesso', 'Foto capturada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao capturar foto');
      console.log('Erro na captura:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status periodicamente
  useEffect(() => {
    checkCameraStatus();
    const interval = setInterval(checkCameraStatus, 10000); // A cada 10 segundos
    
    return () => clearInterval(interval);
  }, [checkCameraStatus]);

  if (!isConnected) {
    return (
      <View style={[
        styles.container,
        { 
          backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
          borderColor: isDark ? '#333333' : '#e0e0e0'
        }
      ]}>
        <View style={styles.disconnectedContainer}>
          <Text style={[
            styles.disconnectedText,
            { color: isDark ? '#666666' : '#999999' }
          ]}>
            📷 Câmera Desconectada
          </Text>
          <Text style={[
            styles.disconnectedSubtext,
            { color: isDark ? '#555555' : '#bbbbbb' }
          ]}>
            Verifique se a ESP32-CAM está ligada e conectada ao WiFi
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={checkCameraStatus}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: '#ff4444' }]} />
          <Text style={styles.statusText}>Desconectado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
        borderColor: isDark ? '#333333' : '#e0e0e0'
      }
    ]}>
      {/* Stream da Câmera */}
      {streamUrl && (
        <Image
          source={{ uri: streamUrl }}
          style={styles.streamImage}
          onError={(error) => {
            console.log('Erro no stream:', error);
            setIsConnected(false);
          }}
        />
      )}

      {/* Overlay com controles */}
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
          onPress={capturePhoto}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.captureButtonText}>📸</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
        <Text style={styles.statusText}>Conectado</Text>
      </View>

      {/* Última foto capturada */}
      {lastCapture && (
        <View style={styles.lastCaptureContainer}>
          <Image 
            source={{ uri: lastCapture }}
            style={styles.thumbnailImage}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 300,
  },
  disconnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  disconnectedText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  disconnectedSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
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
  streamImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  captureButtonText: {
    fontSize: 24,
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
  lastCaptureContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 4,
  },
  thumbnailImage: {
    width: 60,
    height: 45,
    borderRadius: 4,
  },
});