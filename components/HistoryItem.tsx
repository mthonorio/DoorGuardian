import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageCapture } from '../types/history';
import { useColorScheme } from '../lib/useColorScheme';

interface HistoryItemProps {
  capture: ImageCapture;
  onPress: (capture: ImageCapture) => void;
  onShare?: (capture: ImageCapture) => void;
  onDelete?: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  capture,
  onPress,
  onShare,
  onDelete,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDelete = () => {
    Alert.alert('Confirmar exclusão', 'Deseja realmente excluir esta captura?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => onDelete?.(capture.id),
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : 'white' }]}
      onPress={() => onPress(capture)}
      activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: capture.thumbnailUri || capture.imageUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playIcon}>
          <Ionicons name="expand" size={16} color="white" />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.dateText, { color: isDark ? '#ffffff' : '#333' }]}>
          {formatDate(capture.timestamp)}
        </Text>
        {capture.description && (
          <Text
            style={[styles.descriptionText, { color: isDark ? '#cccccc' : '#666' }]}
            numberOfLines={2}>
            {capture.description}
          </Text>
        )}
        {capture.location && (
          <Text
            style={[styles.locationText, { color: isDark ? '#999999' : '#999' }]}
            numberOfLines={1}>
            📍 {capture.location}
          </Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {onShare && (
          <TouchableOpacity style={styles.actionButton} onPress={() => onShare(capture)}>
            <Ionicons name="share-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  playIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});
