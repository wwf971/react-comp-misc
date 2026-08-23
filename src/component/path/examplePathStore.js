import { makeAutoObservable } from 'mobx';

const DEFAULT_SEGMENTS = [
  { name: 'Users' },
  { name: 'timwang' },
  { name: 'Documents' },
  { name: 'Projects' },
  { name: 'myapp' },
];

class StorePathExample {
  currentPath = { segments: DEFAULT_SEGMENTS.map((segment) => ({ ...segment })) };

  emptyDemoPath = { segments: [] };

  serverWindows = null;

  serverUnix = null;

  serverEmpty = null;

  activityNote = '';

  newSegmentName = '';

  constructor({ storeSimServer }) {
    this.storeSimServer = storeSimServer;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  serverLineSet(serverKey, value) {
    if (serverKey === 'windows') this.serverWindows = value;
    if (serverKey === 'unix') this.serverUnix = value;
    if (serverKey === 'empty') this.serverEmpty = value;
    return { code: 0 };
  }

  activityNoteSet(text) {
    this.activityNote = text;
    return { code: 0 };
  }

  newSegmentNameSet(text) {
    this.newSegmentName = text;
    return { code: 0 };
  }

  currentPathSet(pathData) {
    this.currentPath = pathData;
    return { code: 0 };
  }

  emptyDemoPathSet(pathData) {
    this.emptyDemoPath = pathData;
    return { code: 0 };
  }

  segmentNavigate(index) {
    const newSegments = this.currentPath.segments.slice(0, index + 1);
    this.currentPath = { segments: newSegments };
    this.activityNote = `Navigated to: /${newSegments.map((segment) => segment.name).join('/')}`;
    return { code: 0 };
  }

  segmentAdd() {
    const name = this.newSegmentName.trim();
    if (!name) return { code: -1, message: 'Segment name is empty' };
    this.currentPath = {
      segments: [...this.currentPath.segments, { name }],
    };
    this.newSegmentName = '';
    this.activityNote = `Added segment: ${name}`;
    return { code: 0 };
  }

  goToRoot() {
    this.currentPath = { segments: [] };
    this.activityNote = 'Navigated to root';
    return { code: 0 };
  }

  async pathCommit(serverKey, pathData, onAccepted) {
    if (pathData.segments.some((segment) => segment.name === 'invalid')) {
      this.serverLineSet(serverKey, {
        ok: false,
        text: 'Server rejected: invalid path (segment name "invalid" is not allowed).',
      });
      return false;
    }

    const result = await this.storeSimServer.requestRun('path commit');
    if (result.code !== 0) {
      this.serverLineSet(serverKey, {
        ok: false,
        text: 'Server rejected: path does not exist on the server.',
      });
      return false;
    }

    onAccepted(pathData);
    this.serverLineSet(serverKey, {
      ok: true,
      text: 'Server OK: path change accepted.',
    });
    return true;
  }

  async pathCommitWindows(pathData) {
    return this.pathCommit('windows', pathData, (nextPathData) => this.currentPathSet(nextPathData));
  }

  async pathCommitUnix(pathData) {
    return this.pathCommit('unix', pathData, (nextPathData) => this.currentPathSet(nextPathData));
  }

  async pathCommitEmpty(pathData) {
    return this.pathCommit('empty', pathData, (nextPathData) => this.emptyDemoPathSet(nextPathData));
  }
}

function createStorePathExample(options) {
  return new StorePathExample(options);
}

export { createStorePathExample };
export default StorePathExample;
