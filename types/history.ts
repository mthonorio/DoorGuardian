export interface ImageCapture {
  id: string;
  imageUri: string;
  timestamp: Date;
  thumbnailUri?: string;
  description?: string;
  location?: string;
}

export interface AccessHistory {
  id: string;
  captures: ImageCapture[];
  totalCount: number;
}

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface HistoryFilters {
  period: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
}
