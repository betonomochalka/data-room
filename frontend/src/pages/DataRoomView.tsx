import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Folder, FileText, Trash2, Edit, Upload, Search } from 'lucide-react';
import { DataRoom, Folder as FolderType, File as FileType, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { FileTree } from '../components/FileTree';
import { formatDate, formatBytes } from '../lib/utils';
import { api } from '../lib/api';


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
  


  // Fetch data room
  const { data: dataRoomData } = useQuery<ApiResponse<DataRoom>>({
    queryKey: ['dataRoom', id],
    queryFn: async () => {
      const response = await api.get(`/data-rooms`, { params: { id } });
      return response.data;
    },
    enabled: !!id && !folderId,
  });

  // Fetch folder contents
  const { data: folderData } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: async () => {
      const response = await api.get(`/folders`, { params: { id: folderId } });
      return response.data;
    },
    enabled: !!folderId,
  });

  // Fetch folders for data room
  const { data: foldersData } = useQuery({
    queryKey: ['folders', id],
    queryFn: async () => {
      const response = await api.get(`/data-rooms?id=${id}&action=folders`);
      console.log('📁 Folders response:', response.data);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch files for data room or folder
  const { data: filesData } = useQuery({
    queryKey: ['files', id, folderId],
    queryFn: async () => {
      const response = await api.get(folderId ? `/folders?id=${folderId}&action=files` : `/data-rooms?id=${id}&action=files`);
      console.log('📄 Files response:', response.data);
      return response.data;
    },
    enabled: !!id,
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/folders', {
        name,
        dataRoomId: id,
        parentId: folderId || null,
      });
      return response.data.data;
    },
    onSuccess: () => {
      setIsCreateFolderDialogOpen(false);
      setNewFolderName('');
      // Invalidate relevant queries
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: ['folder', folderId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['folders', id] });
      }
    },
    onError: (error: any) => {
      console.error('Folder creation error:', error);
      alert(`Failed to create folder: ${error.message}`);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderIdToDelete: string) => {
      await api.delete(`/folders/${folderIdToDelete}`);
      return { id: folderIdToDelete };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: ['folder', folderId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['folders', id] });
      }
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(`/files/${fileId}`);
      return { id: fileId };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['files', id, folderId] });
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`/folders/${id}`, { name });
      return response.data.data;
    },
    onSuccess: () => {
      setIsRenameDialogOpen(false);
      setRenameItem(null);
      setNewName('');
      // Invalidate relevant queries
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: ['folder', folderId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['folders', id] });
      }
    },
  });

  const renameFileMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`/files/${id}`, { name });
      return response.data.data;
    },
    onSuccess: () => {
      setIsRenameDialogOpen(false);
      setRenameItem(null);
      setNewName('');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['files', id, folderId] });
    },
  });


  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, name, folderId }: { file: File; name: string; folderId: string }) => {
      // Check file size (Vercel free tier limit: 4.5MB)
      const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes
      if (file.size > maxSize) {
        throw new Error(`File size exceeds 4.5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please upgrade your Vercel plan or use a smaller file.`);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('folderId', folderId);
      
      const response = await api.post('/files?action=upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    },
    onSuccess: () => {
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadFileName('');
      alert('✅ File uploaded successfully!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['files', id, folderId] });
    },
    onError: (error: any) => {
      console.error('File upload error:', error);
      const message = error.response?.status === 413 
        ? 'File too large! Vercel free tier has a 4.5MB limit.'
        : error.message || 'File upload failed';
      alert(`❌ Upload failed: ${message}`);
    },
  });

  // Get current folder's contents
  const getCurrentFolderContents = () => {
    if (folderId) {
      // Show contents of specific folder
      return {
        folders: folderData?.data?.children || [],
        files: folderData?.data?.files || []
      };
    } else {
      // Show root level contents (root folders and files)
      return {
        folders: foldersData?.data || [],
        files: filesData?.data || []
      };
    }
  };

  const { folders, files } = getCurrentFolderContents();
  const isLoading = !folderId ? (foldersData?.isLoading || filesData?.isLoading) : (folderData?.isLoading || filesData?.isLoading);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && uploadFileName.trim()) {
      // Upload to current folder (or create a default folder if at root level)
      let targetFolderId = folderId;
      
      if (!targetFolderId) {
        // At root level - create a default folder if none exists
        const rootFolders = foldersData?.data || [];
        if (rootFolders.length === 0) {
          alert('Please create a folder first before uploading files');
          return;
        }
        targetFolderId = rootFolders[0].id;
      }
      
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

  // Search across all folders and files, not just current view
  const searchAllContent = () => {
    if (!searchQuery.trim()) {
      return { folders, files };
    }

    const query = searchQuery.toLowerCase();
    // For now, search only in current view since we don't have a global search API
    const matchingFolders = folders.filter((folder: FolderType) => 
      folder.name.toLowerCase().includes(query)
    );
    const matchingFiles = files.filter((file: FileType) => 
      file.name.toLowerCase().includes(query)
    );

    return { folders: matchingFolders, files: matchingFiles };
  };

  const { folders: filteredFolders, files: filteredFiles } = searchAllContent();

  const handleFolderClick = (folderId: string) => {
    navigate(`/data-rooms/${id}/folders/${folderId}`);
  };

  const handleFileClick = (fileId: string) => {
    const file = files.find((f: FileType) => f.id === fileId);
    if (file) {
      // Open file in new tab using the blobUrl from the database
      if (file.blobUrl) {
        if (file.fileType === 'application/pdf') {
          // Open PDF in new tab with proper viewer
          const pdfWindow = window.open('', '_blank');
          if (pdfWindow) {
            pdfWindow.document.write(`
              <html>
                <head>
                  <title>${file.name}</title>
                  <style>
                    body { margin: 0; padding: 0; background: #f5f5f5; }
                    .container { width: 100%; height: 100vh; display: flex; flex-direction: column; }
                    .header { background: white; padding: 10px; border-bottom: 1px solid #ddd; }
                    .viewer { flex: 1; background: white; }
                    iframe { width: 100%; height: 100%; border: none; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h3>${file.name}</h3>
                    </div>
                    <div class="viewer">
                      <iframe src="${file.blobUrl}" type="application/pdf"></iframe>
                    </div>
                  </div>
                </body>
              </html>
            `);
            pdfWindow.document.close();
          }
        } else {
          // For other file types, create a download link
          const link = document.createElement('a');
          link.href = file.blobUrl;
          link.download = file.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        alert('File not found. Please re-upload the file.');
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* File Tree Sidebar */}
      <FileTree
        folders={
          Array.isArray(foldersData?.data) 
            ? foldersData.data 
            : (foldersData?.data?.folders || [])
        }
        files={
          Array.isArray(filesData?.data) 
            ? filesData.data 
            : (filesData?.data?.files || [])
        }
        onFolderClick={handleFolderClick}
        onFileClick={handleFileClick}
        currentPath={folderId}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Data Rooms
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
          {/* Empty State */}
          {filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No files or folders yet</h3>
                <p className="text-muted-foreground mb-6">
                  {folderId 
                    ? 'Upload files or create folders to get started'
                    : 'Create folders to organize your documents'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setIsCreateFolderDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Folder
                  </Button>
                  {folderId && (
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                    {filteredFiles.map((file: FileType) => {
                      const fileFolder = (foldersData?.data || []).find((f: FolderType) => f.id === file.folderId);
                      return (
                    <Card key={file.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-6 w-6 text-red-500" />
                            <div className="min-w-0">
                              <h3 className="font-medium truncate">{file.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {file.size ? formatBytes(file.size) : 'Unknown size'} · {formatDate(file.createdAt)}
                                {searchQuery.trim() && fileFolder && (
                                  <span className="ml-2 text-blue-600">in {fileFolder.name}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileClick(file.id)}
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
                  );
                })}
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
      </div>
    </div>
  );
};

