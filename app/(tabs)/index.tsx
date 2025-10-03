import { Stack } from 'expo-router';
import * as React from 'react';
import { View, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { Icon } from '@roninoss/icons';

import { Text } from '~/components/nativewindui/Text';
import { CameraStream } from '~/components/CameraStream';
import { useColorScheme } from '~/lib/useColorScheme';

export default function Home() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [cameraConnected, setCameraConnected] = React.useState(false);

  const handleOpenDoor = () => {
    Alert.alert('Abrir Porta', 'Deseja realmente abrir a porta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Abrir',
        style: 'destructive',
        onPress: () => {
          // Aqui você implementará a lógica para abrir a porta
          console.log('Porta aberta!');
          Alert.alert('Sucesso', 'Porta aberta com sucesso!');
        },
      },
    ]);
  };

  const handleLockDoor = () => {
    Alert.alert('Travar Tranca', 'Deseja travar a tranca da porta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Travar',
        onPress: () => {
          // Aqui você implementará a lógica para travar a tranca
          console.log('Tranca travada!');
          Alert.alert('Sucesso', 'Tranca travada com sucesso!');
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'DoorGuardian', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
            🚪 DoorGuardian
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#cccccc' : '#666666' }]}>
            Sistema de Monitoramento Inteligente
          </Text>
        </View>

        {/* Camera Stream Area */}
        <View style={styles.cameraWrapper}>
          <CameraStream
            esp32Ip="192.168.0.8" // Substitua pelo IP da sua ESP32-CAM
            isDark={isDark}
            onStatusChange={setCameraConnected}
          />
        </View>

        {/* Control Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Open Door Button */}
          <TouchableOpacity
            style={[styles.button, styles.openButton]}
            onPress={handleOpenDoor}
            activeOpacity={0.8}>
            <Icon name="key" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Abrir Porta</Text>
          </TouchableOpacity>

          {/* Lock Door Button */}
          <TouchableOpacity
            style={[styles.button, styles.lockButton]}
            onPress={handleLockDoor}
            activeOpacity={0.8}>
            <Icon name="lock" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Travar Tranca</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Icon name="clock" size={20} color={isDark ? '#ffffff' : '#000000'} />
            <Text style={[styles.quickActionText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Histórico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Icon name="cog" size={20} color={isDark ? '#ffffff' : '#000000'} />
            <Text style={[styles.quickActionText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Configurações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Icon name="bell" size={20} color={isDark ? '#ffffff' : '#000000'} />
            <Text style={[styles.quickActionText, { color: isDark ? '#ffffff' : '#000000' }]}>
              Notificações
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  cameraWrapper: {
    flex: 1,
    marginBottom: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#22c55e',
  },
  lockButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
});
