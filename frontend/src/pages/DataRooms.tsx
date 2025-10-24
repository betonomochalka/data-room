import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';
import { DataRoom, PaginatedResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { formatDate } from '../lib/utils';

export const DataRooms: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDataRoomName, setNewDataRoomName] = useState('');
  const getInitialDataRooms = (): DataRoom[] => {
    const saved = localStorage.getItem('user-data-rooms');
    if (saved) {
      return JSON.parse(saved);
    }
    return []; // Start with empty data rooms
  };

  const [tempDataRooms, setTempDataRooms] = useState<DataRoom[]>(getInitialDataRooms);
  // const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: dataRoomsData, isLoading } = useQuery<PaginatedResponse<DataRoom>>({
    queryKey: ['dataRooms'],
    queryFn: async () => {
      // Temporary bypass - return mock data
      console.log('Temporary bypass - returning mock data rooms');
      return {
        success: true,
        data: tempDataRooms,
        pagination: {
          page: 1,
          limit: 10,
          total: tempDataRooms.length,
          totalPages: 1
        }
      };
    },
  });

  const saveDataRooms = (dataRooms: DataRoom[]) => {
    localStorage.setItem('user-data-rooms', JSON.stringify(dataRooms));
    setTempDataRooms(dataRooms);
  };

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      // Temporary bypass - create mock data room
      console.log('Temporary bypass - creating mock data room');
      const newDataRoom: DataRoom = {
        id: `temp-${Date.now()}`,
        name: name,
        ownerId: 'temp-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { folders: 0 }
      };
      const updatedDataRooms = [...tempDataRooms, newDataRoom];
      saveDataRooms(updatedDataRooms);
      return newDataRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataRooms'] });
      setIsCreateDialogOpen(false);
      setNewDataRoomName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Temporary bypass - delete mock data room
      console.log('Temporary bypass - deleting mock data room');
      const updatedDataRooms = tempDataRooms.filter(room => room.id !== id);
      saveDataRooms(updatedDataRooms);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataRooms'] });
      // setDeleteId(null); // Commented out since setDeleteId is not used
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDataRoomName.trim()) {
      createMutation.mutate(newDataRoomName);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure? This will delete all folders and files in this data room.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Data Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Manage your secure document repositories
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Data Room
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : dataRoomsData?.data && dataRoomsData.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataRoomsData.data.map((dataRoom) => (
            <Card key={dataRoom.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  {dataRoom.name}
                </CardTitle>
                <CardDescription>
                  Created {formatDate(dataRoom.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {dataRoom._count?.folders || 0} folder{dataRoom._count?.folders !== 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/data-rooms/${dataRoom.id}`}>
                      <Button variant="outline" size="sm">
                        Open
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(dataRoom.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Rooms Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first data room to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Data Room
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Data Room</DialogTitle>
            <DialogDescription>
              Enter a name for your new data room
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Data Room Name"
              value={newDataRoomName}
              onChange={(e) => setNewDataRoomName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

