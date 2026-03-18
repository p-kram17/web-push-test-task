import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'push-test-task',
      timestamp: new Date().toISOString(),
    };
  }
}
