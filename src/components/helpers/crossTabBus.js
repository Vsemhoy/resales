const CHANNEL_NAME = 'resales-events';
const STORAGE_KEY = '__resales_cross_tab_event__';

let channel = null;

const getChannel = () => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
};

export const emitOrgLogEvent = ({ status, orgId, orgName = null }) => {
  const payload = {
    type: 'ORG_LOG_EVENT',
    status,
    orgId: orgId != null ? String(orgId) : null,
    orgName,
    ts: Date.now(),
  };

  const bc = getChannel();
  if (bc) {
    bc.postMessage(payload);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}
};

export const onOrgLogEvent = (handler) => {
  if (typeof window === 'undefined') return () => {};

  const onMessage = (event) => {
    const data = event?.data;
    if (data?.type === 'ORG_LOG_EVENT') {
      handler(data);
    }
  };

  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const data = JSON.parse(event.newValue);
      if (data?.type === 'ORG_LOG_EVENT') {
        handler(data);
      }
    } catch (e) {}
  };

  const bc = getChannel();
  if (bc) {
    bc.addEventListener('message', onMessage);
  }
  window.addEventListener('storage', onStorage);

  return () => {
    if (bc) {
      bc.removeEventListener('message', onMessage);
    }
    window.removeEventListener('storage', onStorage);
  };
};
