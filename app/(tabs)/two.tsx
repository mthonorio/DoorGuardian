import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, View, FlatList, Text, RefreshControl, Alert, Share } from 'react-native';
import { useHistoryStore } from '../../store/historyStore';
import { HistoryItem } from '../../components/HistoryItem';
import { HistoryFilters } from '../../components/HistoryFilters';
import { ImageViewerModal } from '../../components/ImageViewerModal';
import { ImageCapture } from '../../types/history';
import { useColorScheme } from '../../lib/useColorScheme';

export default function HistoryScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    filteredCaptures,
    captures,
    filters,
    isLoading,
    loadHistory,
    removeCapture,
    applyFilters,
  } = useHistoryStore();

  const [selectedCapture, setSelectedCapture] = useState<ImageCapture | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleCapturePress = (capture: ImageCapture) => {
    setSelectedCapture(capture);
  };

  const handleShare = async (capture: ImageCapture) => {
    try {
      await Share.share({
        message: `Captura do DoorGuardian - ${new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(capture.timestamp)}`,
        url: capture.imageUri,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a imagem');
    }
  };

  const handleDelete = (id: string) => {
    removeCapture(id);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: isDark ? '#ffffff' : '#333' }]}>
        Nenhuma captura encontrada
      </Text>
      <Text style={[styles.emptyText, { color: isDark ? '#cccccc' : '#666' }]}>
        {filters.period === 'all'
          ? 'Ainda não há capturas salvas no histórico'
          : 'Não há capturas no período selecionado'}
      </Text>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: ImageCapture }) => (
    <HistoryItem
      capture={item}
      onPress={handleCapturePress}
      onShare={handleShare}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Histórico de Acessos',
          headerStyle: {
            backgroundColor: isDark ? '#1a1a1a' : '#007AFF',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f8f9fa' }]}>
        <HistoryFilters
          filters={filters}
          onFiltersChange={applyFilters}
          totalCount={captures.length}
          filteredCount={filteredCaptures.length}
        />

        <FlatList
          data={filteredCaptures}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredCaptures.length === 0 && styles.listContainerEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[isDark ? '#ffffff' : '#007AFF']}
              tintColor={isDark ? '#ffffff' : '#007AFF'}
              progressBackgroundColor={isDark ? '#1a1a1a' : '#ffffff'}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />

        <ImageViewerModal
          visible={selectedCapture !== null}
          capture={selectedCapture}
          onClose={() => setSelectedCapture(null)}
          onDelete={handleDelete}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
