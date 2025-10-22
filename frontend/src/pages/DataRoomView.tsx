import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Folder, FileText, Trash2, Edit, Upload, Search } from 'lucide-react';
import api from '../lib/api';
import { DataRoom, Folder as FolderType, File as FileType, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { formatDate, formatBytes } from '../lib/utils';

export const DataRoomView: React.FC = () => {
  const { id, folderId } = useParams<{ id: string; folderId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameItem, setRenameItem] = useState<{ id: string; name: string; type: 'folder' | 'file' } | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data room or folder contents
  const { data: dataRoomData, isLoading: isLoadingDataRoom } = useQuery<ApiResponse<DataRoom>>({
    queryKey: ['dataRoom', id],
    queryFn: async () => {
      const response = await api.get(`/data-rooms/${id}`);
      return response.data;
    },
    enabled: !folderId,
  });

  const { data: folderData, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: async () => {
      const response = await api.get(`/folders/${folderId}/contents`);
      return response.data;
    },
    enabled: !!folderId,
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('[CreateFolder] Sending request:', {
        name,
        dataRoomId: id,
        parentId: folderId || null,
      });
      
      const response = await api.post('/folders', {
        name,
        dataRoomId: id,
        parentId: folderId || null,
      });
      
      console.log('[CreateFolder] Success:', response.data);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('[CreateFolder] Invalidating queries');
      queryClient.invalidateQueries({ queryKey: folderId ? ['folder', folderId] : ['dataRoom', id] });
      setIsCreateFolderDialogOpen(false);
      setNewFolderName('');
    },
    onError: (error: any) => {
      console.error('[CreateFolder] Error:', error);
      console.error('[CreateFolder] Error response:', error.response?.data);
      alert(`Failed to create folder: ${error.response?.data?.error || error.message}`);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const response = await api.delete(`/folders/${folderId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderId ? ['folder', folderId] : ['dataRoom', id] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await api.delete(`/files/${fileId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderId ? ['folder', folderId] : ['dataRoom', id] });
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.put(`/folders/${id}`, { name });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderId ? ['folder', folderId] : ['dataRoom', id] });
      setIsRenameDialogOpen(false);
      setRenameItem(null);
      setNewName('');
    },
  });

  const renameFileMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.put(`/files/${id}`, { name });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderId ? ['folder', folderId] : ['dataRoom', id] });
      setIsRenameDialogOpen(false);
      setRenameItem(null);
      setNewName('');
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, name, folderId }: { file: File; name: string; folderId: string }) => {
      console.log('[UploadFile] Uploading:', { fileName: file.name, size: file.size, name, folderId });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('folderId', folderId);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[UploadFile] Success:', response.data);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('[UploadFile] Invalidating queries');
      queryClient.invalidateQueries({ queryKey: folderId ? ['folder', folderId] : ['dataRoom', id] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadFileName('');
    },
    onError: (error: any) => {
      console.error('[UploadFile] Error:', error);
      console.error('[UploadFile] Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload file';
      alert(`Upload failed: ${errorMessage}`);
    },
  });

  // const currentData = folderId ? folderData?.data : dataRoomData?.data;
  const folders = folderId ? folderData?.data?.children || [] : dataRoomData?.data?.folders || [];
  const files = folderId ? folderData?.data?.files || [] : [];
  const isLoading = folderId ? isLoadingFolder : isLoadingDataRoom;

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && uploadFileName.trim()) {
      // For root data room, we need at least one folder
      if (!folderId && folders.length === 0) {
        alert('Please create a folder first before uploading files');
        return;
      }
      
      const targetFolderId = folderId || folders[0]?.id;
      if (targetFolderId) {
        uploadFileMutation.mutate({ file: selectedFile, name: uploadFileName, folderId: targetFolderId });
      }
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameItem && newName.trim()) {
      if (renameItem.type === 'folder') {
        renameFolderMutation.mutate({ id: renameItem.id, name: newName });
      } else {
        renameFileMutation.mutate({ id: renameItem.id, name: newName });
      }
    }
  };

  const filteredFolders = folders.filter((folder: FolderType) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter((file: FileType) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {folderId ? folderData?.data?.folder?.name : dataRoomData?.data?.name}
          </h1>
          <p className="text-muted-foreground">
            {folderId ? `Folder in ${dataRoomData?.data?.name}` : 'Data Room'}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setIsCreateFolderDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
        {folderId && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        )}
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          {filteredFolders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFolders.map((folder: FolderType) => (
                  <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex items-center gap-3 flex-1"
                          onClick={() => navigate(`/data-rooms/${id}/folders/${folder.id}`)}
                        >
                          <Folder className="h-8 w-8 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{folder.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {folder._count?.files || 0} files · {folder._count?.children || 0} folders
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameItem({ id: folder.id, name: folder.name, type: 'folder' });
                              setNewName(folder.name);
                              setIsRenameDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this folder and all its contents?')) {
                                deleteFolderMutation.mutate(folder.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredFiles.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Files</h2>
              <div className="grid grid-cols-1 gap-2">
                {filteredFiles.map((file: FileType) => (
                  <Card key={file.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-6 w-6 text-red-500" />
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{file.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {file.size ? formatBytes(file.size) : 'Unknown size'} · {formatDate(file.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.blobUrl, '_blank')}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setRenameItem({ id: file.id, name: file.name, type: 'file' });
                              setNewName(file.name);
                              setIsRenameDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm('Delete this file?')) {
                                deleteFileMutation.mutate(file.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Folder className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Items Yet</h3>
                <p className="text-muted-foreground mb-4">Create a folder or upload files to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <Input
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createFolderMutation.isPending}>
                {createFolderMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PDF File</DialogTitle>
            <DialogDescription>Select a PDF file to upload</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setUploadFileName(file.name.replace('.pdf', ''));
                  }
                }}
              />
            </div>
            <Input
              placeholder="File Name"
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploadFileMutation.isPending || !selectedFile}>
                {uploadFileMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameItem?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
            <DialogDescription>Enter a new name</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <Input
              placeholder="New Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={renameFolderMutation.isPending || renameFileMutation.isPending}>
                {(renameFolderMutation.isPending || renameFileMutation.isPending) ? 'Renaming...' : 'Rename'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

