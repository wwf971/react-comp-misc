import { makeAutoObservable, observable, runInAction } from 'mobx';

let nextEntryId = 1;

function fileEntry(name, size, typeLabel) {
  return observable({
    id: nextEntryId++,
    kind: 'file',
    name,
    size,
    typeLabel,
  });
}

function folderEntry(name, childEntries) {
  return observable({
    id: nextEntryId++,
    kind: 'folder',
    name,
    children: observable.array(childEntries),
  });
}

function resolveFolderAlongPath(rootFolder, segmentNames) {
  let node = rootFolder;
  for (const name of segmentNames) {
    const next = node.children.find((c) => c.kind === 'folder' && c.name === name);
    if (!next) return null;
    node = next;
  }
  return node;
}

function pathExistsAsFolder(rootFolder, pathSegments) {
  const names = pathSegments.map((s) => s.name);
  return resolveFolderAlongPath(rootFolder, names) != null;
}

export function createFolderExplorerDemoStore() {
  let pathFeedbackClearTimer = null;

  const treeRoot = folderEntry('', [
    folderEntry('Documents', [
      folderEntry('Projects', [
        fileEntry('App.jsx', '4.2 KB', 'JavaScript'),
        fileEntry('styles.css', '1.8 KB', 'CSS'),
      ]),
      folderEntry('Archive', [fileEntry('old.zip', '512 KB', 'ZIP')]),
      fileEntry('README.md', '2.1 KB', 'Markdown'),
    ]),
    folderEntry('Pictures', [
      fileEntry('logo.png', '24.5 KB', 'PNG'),
      fileEntry('banner.jpg', '120 KB', 'JPEG'),
    ]),
    folderEntry('Music', []),
    fileEntry('notes.txt', '1 KB', 'Text'),
  ]);

  const store = {
    treeRoot,
    pathSegments: observable.array([]),
    selectedRowId: null,
    loading: false,
    loadingMessage: '',
    error: null,
    pathFeedback: null,

    columns: {
      name: { data: 'Name', align: 'left' },
      size: { data: 'Size', align: 'right' },
      type: { data: 'Type', align: 'left' },
      modified: { data: 'Modified', align: 'left' },
    },
    columnsOrder: observable.array(['name', 'size', 'type', 'modified']),
    columnsSize: {
      name: { width: 250, minWidth: 100, resizable: true },
      size: { width: 100, minWidth: 60, resizable: true },
      type: { width: 120, minWidth: 80, resizable: true },
      modified: { width: 180, minWidth: 100, resizable: true },
    },

    get pathDataForBar() {
      return { segments: this.pathSegments };
    },

    get currentFolder() {
      const names = this.pathSegments.map((s) => s.name);
      return resolveFolderAlongPath(this.treeRoot, names);
    },

    get rows() {
      const folder = this.currentFolder;
      if (!folder) return [];
      return folder.children.map((child) => ({
        id: child.id,
        data: {
          name: {
            type: child.kind === 'folder' ? 'folder' : 'file',
            name: child.name,
          },
          size: child.kind === 'folder' ? `${child.children.length} items` : child.size,
          type: child.kind === 'folder' ? 'Folder' : child.typeLabel,
          modified: '2026-02-10 12:00',
        },
      }));
    },

    clearPathFeedbackTimer() {
      if (pathFeedbackClearTimer != null) {
        clearTimeout(pathFeedbackClearTimer);
        pathFeedbackClearTimer = null;
      }
    },

    showPathFeedbackBriefly(feedback, durationMs = 3500) {
      this.clearPathFeedbackTimer();
      this.pathFeedback = feedback;
      pathFeedbackClearTimer = setTimeout(() => {
        pathFeedbackClearTimer = null;
        runInAction(() => {
          store.pathFeedback = null;
        });
      }, durationMs);
    },

    trimPathToSegmentIndex(index) {
      this.clearPathFeedbackTimer();
      this.pathFeedback = null;
      const next = this.pathSegments.slice(0, index + 1);
      this.pathSegments.replace(next);
      this.selectedRowId = null;
    },

    openChildFolderByName(folderName) {
      const folder = this.currentFolder;
      if (!folder) return false;
      const child = folder.children.find((c) => c.kind === 'folder' && c.name === folderName);
      if (!child) return false;
      this.clearPathFeedbackTimer();
      this.pathFeedback = null;
      this.pathSegments.push({ name: child.name });
      this.selectedRowId = null;
      return true;
    },

    trySetPathFromParsed(pathData) {
      const segs = pathData.segments || [];
      if (!pathExistsAsFolder(this.treeRoot, segs)) {
        return { ok: false, reason: 'Path does not exist or is not a folder.' };
      }
      this.pathSegments.replace(segs.map((s) => ({ name: s.name })));
      this.selectedRowId = null;
      return { ok: true };
    },

    setSelectedRow(rowId) {
      this.selectedRowId = rowId;
    },
  };

  makeAutoObservable(store);

  return store;
}
