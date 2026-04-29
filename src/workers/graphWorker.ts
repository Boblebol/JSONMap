import { processGraphRequest, type GraphProcessingRequest } from '../utils/graphProcessing';

self.onmessage = (event: MessageEvent<GraphProcessingRequest>) => {
    const messages = processGraphRequest(event.data);
    messages.forEach(message => self.postMessage(message));
};

export { };
