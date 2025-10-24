import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Plus, Folder, FileText, Trash2, Edit, Upload, Search } from 'lucide-react';
import { DataRoom, Folder as FolderType, File as FileType, ApiResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { FileTree } from '../components/FileTree';
import { formatDate, formatBytes } from '../lib/utils';

export const DataRoomView: React.FC = () => {
  const { id, folderId } = useParams<{ id: string; folderId?: string }>();
  const navigate = useNavigate();
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameItem, setRenameItem] = useState<{ id: string; name: string; type: 'folder' | 'file' } | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Temporary state for mock data
  const [tempFolders, setTempFolders] = useState<FolderType[]>([
    {
      id: 'temp-folder-1',
      name: 'Documents',
      dataRoomId: id || 'temp-room',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { files: 2, children: 1 }
    },
    {
      id: 'temp-folder-2',
      name: 'Images',
      dataRoomId: id || 'temp-room',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { files: 0, children: 0 }
    },
    {
      id: 'temp-folder-3',
      name: 'Subfolder',
      dataRoomId: id || 'temp-room',
      parentId: 'temp-folder-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { files: 0, children: 0 }
    }
  ]);
  const [tempFiles, setTempFiles] = useState<FileType[]>([
    {
      id: 'temp-file-1',
      name: 'Sample Document.pdf',
      fileType: 'application/pdf',
      size: 1024000,
      blobUrl: '#',
      folderId: 'temp-folder-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'temp-file-2',
      name: 'Another File.pdf',
      fileType: 'application/pdf',
      size: 2048000,
      blobUrl: '#',
      folderId: 'temp-folder-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Temporary bypass for data room fetching
  const { data: dataRoomData, isLoading: isLoadingDataRoom } = useQuery<ApiResponse<DataRoom>>({
    queryKey: ['dataRoom', id],
    queryFn: async () => {
      console.log('Temporary bypass - returning mock data room');
      return {
        success: true,
        data: {
          id: id || 'temp-room',
          name: 'Sample Data Room',
          ownerId: 'temp-user-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folders: tempFolders
        }
      };
    },
    enabled: !folderId,
  });

  // Temporary bypass for folder fetching
  const { data: folderData, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: async () => {
      console.log('Temporary bypass - returning mock folder data');
      return {
        success: true,
        data: {
          folder: { id: folderId, name: 'Sample Folder' },
          children: tempFolders,
          files: tempFiles
        }
      };
    },
    enabled: !!folderId,
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('Temporary bypass - creating mock folder');
      const newFolder: FolderType = {
        id: `temp-folder-${Date.now()}`,
        name: name,
        dataRoomId: id || 'temp-room',
        parentId: folderId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { files: 0, children: 0 }
      };
      setTempFolders(prev => [...prev, newFolder]);
      return newFolder;
    },
    onSuccess: () => {
      console.log('Temporary bypass - folder created successfully');
      setIsCreateFolderDialogOpen(false);
      setNewFolderName('');
    },
    onError: (error: any) => {
      console.error('Temporary bypass - folder creation error:', error);
      alert(`Failed to create folder: ${error.message}`);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderIdToDelete: string) => {
      console.log('Temporary bypass - deleting mock folder');
      setTempFolders(prev => prev.filter(folder => folder.id !== folderIdToDelete));
      return { id: folderIdToDelete };
    },
    onSuccess: () => {
      console.log('Temporary bypass - folder deleted successfully');
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      console.log('Temporary bypass - deleting mock file');
      setTempFiles(prev => prev.filter(file => file.id !== fileId));
      return { id: fileId };
    },
    onSuccess: () => {
      console.log('Temporary bypass - file deleted successfully');
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      console.log('Temporary bypass - renaming mock folder');
      setTempFolders(prev => prev.map(folder => 
        folder.id === id ? { ...folder, name, updatedAt: new Date().toISOString() } : folder
      ));
      return { id, name };
    },
    onSuccess: () => {
      console.log('Temporary bypass - folder renamed successfully');
      setIsRenameDialogOpen(false);
      setRenameItem(null);
      setNewName('');
    },
  });

  const renameFileMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      console.log('Temporary bypass - renaming mock file');
      setTempFiles(prev => prev.map(file => 
        file.id === id ? { ...file, name, updatedAt: new Date().toISOString() } : file
      ));
      return { id, name };
    },
    onSuccess: () => {
      console.log('Temporary bypass - file renamed successfully');
      setIsRenameDialogOpen(false);
      setRenameItem(null);
      setNewName('');
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, name, folderId }: { file: File; name: string; folderId: string }) => {
      console.log('Temporary bypass - creating mock file');
      const newFile: FileType = {
        id: `temp-file-${Date.now()}`,
        name: name,
        fileType: file.type || 'application/pdf',
        size: file.size,
        blobUrl: URL.createObjectURL(file),
        folderId: folderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTempFiles(prev => [...prev, newFile]);
      return newFile;
    },
    onSuccess: () => {
      console.log('Temporary bypass - file uploaded successfully');
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadFileName('');
    },
    onError: (error: any) => {
      console.error('Temporary bypass - file upload error:', error);
      alert(`Upload failed: ${error.message}`);
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

  const handleFolderClick = (folderId: string) => {
    navigate(`/data-rooms/${id}/folders/${folderId}`);
  };

  const handleFileClick = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.blobUrl) {
      window.open(file.blobUrl, '_blank');
    }
  };

  return (
    <div className="flex h-screen">
      {/* File Tree Sidebar */}
      <FileTree
        folders={tempFolders}
        files={tempFiles}
        onFolderClick={handleFolderClick}
        onFileClick={handleFileClick}
        currentPath={folderId}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
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
      </div>
    </div>
  );
};

