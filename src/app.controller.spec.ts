import { AppService } from './app.service';

describe('AppService', () => {
  it('returns health payload', () => {
    const appService = new AppService();
    const result = appService.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('push-test-task');
    expect(typeof result.timestamp).toBe('string');
  });
});
