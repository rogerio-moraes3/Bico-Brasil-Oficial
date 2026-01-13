type QueueItem = {
  id: string;
  type: 'publishJob' | 'offerService';
  payload: any;
  status: 'pending' | 'syncing' | 'done' | 'failed';
  createdAt: number;
};

const KEY = 'offline_queue_v1';

const readQueue = (): QueueItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as QueueItem[] : [];
  } catch (e) {
    console.error('Error reading offline queue', e);
    return [];
  }
};

const writeQueue = (q: QueueItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(q));
};

export const enqueue = (item: Omit<QueueItem, 'id' | 'status' | 'createdAt'>) => {
  const q = readQueue();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newItem: QueueItem = {
    ...item,
    id,
    status: 'pending',
    createdAt: Date.now()
  };
  q.push(newItem);
  writeQueue(q);
  return newItem;
};

export const getQueue = () => readQueue();

export const clearItem = (id: string) => {
  const q = readQueue().filter(i => i.id !== id);
  writeQueue(q);
};

// Basic processor: caller must provide network functions
export const processQueue = async (handlers: {
  publishJob: (payload: any) => Promise<any>;
  offerService: (payload: any) => Promise<any>;
}, onProgress?: (item: QueueItem) => void) => {
  let q = readQueue();
  for (const item of q) {
    if (item.status !== 'pending') continue;
    try {
      item.status = 'syncing';
      writeQueue(q);
      onProgress?.(item);

      if (item.type === 'publishJob') {
        await handlers.publishJob(item.payload);
      } else if (item.type === 'offerService') {
        await handlers.offerService(item.payload);
      }

      // remove item
      clearItem(item.id);
      onProgress?.({ ...item, status: 'done' });
      q = readQueue();
    } catch (err) {
      console.error('Error syncing item', item, err);
      item.status = 'failed';
      writeQueue(q);
      onProgress?.({ ...item, status: 'failed' });
    }
  }
};

// Auto-process when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    // No-op here; pages can call processQueue with handlers
    console.info('Back online — offline queue can be processed');
  });
}
