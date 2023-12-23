export class Storage {
  static memoryData: Record<string, any> = {};
  constructor(readonly id: string) {}

  set(key: string, value: any) {
    try {
      localStorage.setItem(this.id + ":" + key, value);
    } catch {
      Storage.memoryData[this.id + ":" + key] = value;
      parent.postMessage({ action: "saveLocalStorage", data: Storage.memoryData }, "*");
    }
  }

  get(key: string): string | null {
    try {
      return localStorage.getItem(this.id + ":" + key) || null;
    } catch {
      return Storage.memoryData[this.id + ":" + key] || null;
    }
  }
}
