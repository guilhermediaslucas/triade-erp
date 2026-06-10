import type { Clock } from '../../domain/ports/Clock.js';

// Implementacao concreta da porta Clock. Date em JS ja e UTC internamente;
// a conversao para timezone do usuario acontece so na borda (frontend).
export class SystemClock implements Clock {
  agora(): Date {
    return new Date();
  }
}
