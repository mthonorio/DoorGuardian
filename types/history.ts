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

// API Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// API Response types
export interface ImageData {
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  id: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export interface AccessRecord {
  access: boolean;
  date: string;
  id: string;
  image_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  image: ImageData;
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_num: number | null;
  prev_num: number | null;
}

export interface HistoryApiResponse {
  access_records: AccessRecord[];
  pagination: Pagination;
}
