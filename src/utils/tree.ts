import { VibeEntry } from '../types';

export interface TreeNode extends VibeEntry {
  children: TreeNode[];
}

export const buildTree = (entries: VibeEntry[]): TreeNode[] => {
  const tree: TreeNode[] = [];
  const map: { [key: string]: TreeNode } = {};

  // Initialize all entries as nodes in the map
  entries.forEach(entry => {
    map[entry.id] = { ...entry, children: [] };
  });

  // Link children to their parents
  Object.values(map).forEach(node => {
    const lastSlashIndex = node.id.lastIndexOf('/');
    if (lastSlashIndex > -1) {
      const parentId = node.id.substring(0, lastSlashIndex);
      if (map[parentId] && map[parentId].type === 'folder') {
        map[parentId].children.push(node);
      } else {
        // This case handles files that might be in a path but their parent folder doesn't exist
        // For this app's logic, we'll treat them as root, but a real IDE might flag an error.
        tree.push(node);
      }
    } else {
      // No slash, it's a root node
      tree.push(node);
    }
  });

  const sortChildren = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  };

  const sortTree = (nodes: TreeNode[]) => {
     nodes.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(sortChildren);
  }

  sortTree(tree);

  return tree;
};