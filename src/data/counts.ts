

export enum CounterKeys {
  Bullpen = 'Bullpen',
  RaceNumber = 'RaceNumber'
}

export enum LeftRightTap {
  Left = 'Left',
  Right = 'Right'
}

export class Counter {

  private monitoringFunctions = new Set<Function>();
  private monitoringInterval: null | ReturnType<typeof setInterval> = null;
  public getAllCounts() {
    return {
      raceNumber: this.getCount(CounterKeys.RaceNumber),
      bullpen: this.getCount(CounterKeys.Bullpen)
    }
  }
  private lastCounts: ReturnType<Counter['getAllCounts']>  = {
    bullpen: 0,
    raceNumber: 0
  }
  public checkAndExecuteMonitoringFunctions() {
    const currentCounts = this.getAllCounts();
    const countKeys = Object.keys(currentCounts) as (keyof typeof currentCounts)[];
    const somethingChanged = this.lastCounts != null && countKeys.some(key => currentCounts[key] !== this.lastCounts[key]);
    this.lastCounts = currentCounts;
    if (!somethingChanged) {
      return;
    }
    for (const fn of this.monitoringFunctions) {
      fn();
    }
  }
  public listenForCountChanges(fn: Function) {
    this.monitoringFunctions.add(fn)
    if (!this.monitoringInterval) {
      this.monitoringInterval = setInterval(() => {
        this.checkAndExecuteMonitoringFunctions();
      }, 250)
    }
  }
  public removeListener(fn: Function) {
    this.monitoringFunctions.delete(fn);
  }

  /* basic get/set */
  private getCount(key: CounterKeys) {
    const value = localStorage.getItem(key);
    if (!Number.isInteger(Number(value))) {
      return 0;
    }
    return Number(value)
  }
  private setCount(key: CounterKeys, value: number) {
    console.log('setting value', key, value)
    localStorage.setItem(key, String(value))
    this.checkAndExecuteMonitoringFunctions();
  }

  public incrementCount(key: CounterKeys) {
    const count = this.getCount(key);
    this.setCount(key, count + 1);
  }
  public decrementCount(key: CounterKeys) {
    const count = this.getCount(key);
    this.setCount(key, Math.max(count - 1, 0));
  }

  public taps: LeftRightTap[]  = [];
  private applyActionsDuringTimer() {
    if (this.taps.length >= 3 && this.taps.every(t => t === LeftRightTap.Left)) {
      this.decrementCount(CounterKeys.Bullpen)
      this.decrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length >= 3 && this.taps.every(t => t === LeftRightTap.Right)) {
      this.incrementCount(CounterKeys.Bullpen)
      this.incrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length == 2 && this.taps.every(t => t === LeftRightTap.Left)) {
      this.decrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length == 2 && this.taps.every(t => t === LeftRightTap.Right)) {
      this.incrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length == 1 && this.taps.every(t => t === LeftRightTap.Left)) {
      this.decrementCount(CounterKeys.Bullpen)
    } else if (this.taps.length == 1 && this.taps.every(t => t === LeftRightTap.Right)) {
      this.incrementCount(CounterKeys.Bullpen)
    } else {
      console.log('doing nothing, tap sequence made no sense', this.taps);
    }
    this.taps = [];
  }

  /* track counts */
  private timer: null | ReturnType<typeof setTimeout> = null
  private timerStarted: number | null = null
  private startTimer() {
    if (this.timer != null) {
      return;
    }
    this.timer = setTimeout(() => {
      this.applyActionsDuringTimer();
      this.timer = null;
      this.timerStarted = null;
    }, 3000 /* 3 seconds */)
    this.timerStarted = Date.now();
  }
  public getTimeRemainingOnCounterMs() {
    if (!this.timerStarted) {
      return null;
    }
    return this.timerStarted + 3000 - Date.now();
  }

  public registerTap(tap: LeftRightTap) {
    this.taps.push(tap)
    this.startTimer();
  }

  public dispose() {
    if (this.monitoringInterval) {
      this.taps = [];
      this.monitoringFunctions = new Set();
      clearInterval(this.monitoringInterval);
    }
  }
}

export const FormatCount = (count: number) => {
  const s = String(count);
  if (s.length > 1) {
    return s;
  }
  return `0${s}`;
}