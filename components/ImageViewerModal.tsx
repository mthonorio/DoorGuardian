import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageCapture } from '../types/history';

interface ImageViewerModalProps {
  visible: boolean;
  capture: ImageCapture | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  capture,
  onClose,
  onDelete,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!capture) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Captura do DoorGuardian - ${formatDate(capture.timestamp)}`,
        url: capture.imageUri,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a imagem');
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirmar exclusão', 'Deseja realmente excluir esta captura?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          onDelete?.(capture.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          {!imageLoaded && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}

          <Image
            source={{ uri: capture.imageUri }}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              Alert.alert('Erro', 'Não foi possível carregar a imagem');
            }}
          />
        </View>

        {/* Footer with image info */}
        <View style={styles.footer}>
          <View style={styles.infoContainer}>
            <Text style={styles.dateText}>{formatDate(capture.timestamp)}</Text>

            {capture.description && (
              <Text style={styles.descriptionText}>{capture.description}</Text>
            )}

            {capture.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#999" />
                <Text style={styles.locationText}>{capture.location}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  infoContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  descriptionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
});
