import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';
import { Folder as FolderType, File as FileType } from '../types';

interface FileTreeProps {
  folders: FolderType[];
  files: FileType[];
  onFolderClick: (folderId: string) => void;
  onFileClick: (fileId: string) => void;
  currentPath?: string;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  expanded?: boolean;
}

export const FileTree: React.FC<FileTreeProps> = ({
  folders,
  files,
  onFolderClick,
  onFileClick,
  currentPath
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const buildTree = (): TreeNode[] => {
    // Create a map of folders for easy lookup
    const folderMap = new Map(folders.map(folder => [folder.id, folder]));
    
    // Build tree structure
    const rootNodes: TreeNode[] = [];
    
    // Add root folders (folders with no parent)
    folders.forEach(folder => {
      if (!folder.parentId) {
        rootNodes.push({
          id: folder.id,
          name: folder.name,
          type: 'folder',
          children: []
        });
      }
    });
    
    // Add files to their respective folders
    files.forEach(file => {
      const folder = folderMap.get(file.folderId);
      if (folder && !folder.parentId) {
        const rootFolder = rootNodes.find(node => node.id === folder.id);
        if (rootFolder) {
          rootFolder.children = rootFolder.children || [];
          rootFolder.children.push({
            id: file.id,
            name: file.name,
            type: 'file'
          });
        }
      }
    });
    
    return rootNodes;
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isActive = currentPath === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
            isActive ? 'bg-blue-100 text-blue-700' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleExpanded(node.id);
              onFolderClick(node.id);
            } else {
              onFileClick(node.id);
            }
          }}
        >
          {node.type === 'folder' && (
            <div className="flex items-center gap-1">
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )}
            </div>
          )}
          {node.type === 'file' && (
            <>
              <div className="w-4 h-4" />
              <FileText className="h-4 w-4 text-gray-500" />
            </>
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        
        {node.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const treeNodes = buildTree();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">File Tree</h3>
      <div className="space-y-1">
        {treeNodes.length > 0 ? (
          treeNodes.map(node => renderTreeNode(node))
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            No folders or files yet
          </div>
        )}
      </div>
    </div>
  );
};
