import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryFilters as IHistoryFilters } from '../types/history';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from '../lib/useColorScheme';

interface HistoryFiltersProps {
  filters: IHistoryFilters;
  onFiltersChange: (filters: IHistoryFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const filterOptions = [
  { key: 'all', label: 'Todos', icon: 'infinite-outline' },
  { key: 'today', label: 'Hoje', icon: 'today-outline' },
  { key: 'week', label: 'Última semana', icon: 'calendar-outline' },
  { key: 'month', label: 'Último mês', icon: 'calendar-number-outline' },
  { key: 'custom', label: 'Período customizado', icon: 'options-outline' },
] as const;

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handlePeriodChange = (period: IHistoryFilters['period']) => {
    const newFilters: IHistoryFilters = {
      ...filters,
      period,
    };

    // Reset custom dates when switching away from custom
    if (period !== 'custom') {
      newFilters.customStartDate = undefined;
      newFilters.customEndDate = undefined;
    }

    onFiltersChange(newFilters);
    if (period !== 'custom') {
      setShowFilterModal(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      const newFilters = { ...filters };

      if (datePickerMode === 'start') {
        newFilters.customStartDate = selectedDate;
      } else {
        newFilters.customEndDate = selectedDate;
      }

      onFiltersChange(newFilters);
    }
  };

  const openDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getCurrentFilterLabel = () => {
    const option = filterOptions.find((opt) => opt.key === filters.period);
    return option?.label || 'Filtros';
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : 'white' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
              borderColor: isDark ? '#007AFF' : '#007AFF',
            },
          ]}
          onPress={() => setShowFilterModal(true)}>
          <Ionicons name="filter-outline" size={20} color="#007AFF" />
          <Text style={styles.filterButtonText}>{getCurrentFilterLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>

        <Text style={[styles.countText, { color: isDark ? '#cccccc' : '#666' }]}>
          {filteredCount === totalCount
            ? `${totalCount} capturas`
            : `${filteredCount} de ${totalCount} capturas`}
        </Text>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1a1a1a' : 'white' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#333' }]}>
                Filtrar por período
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#333'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    filters.period === option.key && {
                      backgroundColor: isDark ? '#2a2a2a' : '#f0f8ff',
                    },
                  ]}
                  onPress={() => handlePeriodChange(option.key)}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={filters.period === option.key ? '#007AFF' : isDark ? '#cccccc' : '#666'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: isDark ? '#ffffff' : '#333' },
                      filters.period === option.key && { color: '#007AFF', fontWeight: '500' },
                    ]}>
                    {option.label}
                  </Text>
                  {filters.period === option.key && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}

              {filters.period === 'custom' && (
                <View
                  style={[
                    styles.customDateContainer,
                    { borderTopColor: isDark ? '#333' : '#f0f0f0' },
                  ]}>
                  <Text style={[styles.customDateLabel, { color: isDark ? '#ffffff' : '#333' }]}>
                    Selecione o período:
                  </Text>

                  <View style={styles.dateRow}>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        {
                          backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
                          borderColor: isDark ? '#444' : '#ddd',
                        },
                      ]}
                      onPress={() => openDatePicker('start')}>
                      <Text
                        style={[styles.dateButtonLabel, { color: isDark ? '#cccccc' : '#666' }]}>
                        Data inicial:
                      </Text>
                      <Text style={[styles.dateButtonText, { color: isDark ? '#ffffff' : '#333' }]}>
                        {filters.customStartDate
                          ? formatDate(filters.customStartDate)
                          : 'Selecionar'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateRow}>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        {
                          backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
                          borderColor: isDark ? '#444' : '#ddd',
                        },
                      ]}
                      onPress={() => openDatePicker('end')}>
                      <Text
                        style={[styles.dateButtonLabel, { color: isDark ? '#cccccc' : '#666' }]}>
                        Data final:
                      </Text>
                      <Text style={[styles.dateButtonText, { color: isDark ? '#ffffff' : '#333' }]}>
                        {filters.customEndDate ? formatDate(filters.customEndDate) : 'Selecionar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            datePickerMode === 'start'
              ? filters.customStartDate || new Date()
              : filters.customEndDate || new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterButtonText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  countText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: -4,
  },
  filterOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  customDateContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  customDateLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  dateRow: {
    marginBottom: 12,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateButtonLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
