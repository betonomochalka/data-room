import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface CreateDataRoomRequest {
  name: string;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: string;
  dataRoomId: string;
}

export interface UpdateFolderRequest {
  name?: string;
}

export interface CreateFileRequest {
  name: string;
  fileType: string;
  size?: number;
  folderId: string;
  blobUrl: string;
}

export interface UpdateFileRequest {
  name?: string;
}

export interface SearchRequest {
  query: string;
  dataRoomId: string;
  folderId?: string;
  fileType?: string;
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
