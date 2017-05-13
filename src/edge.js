export class Edge {
  constructor(source, target, type, title) {
    this.target = target;
    this.source = source;
    this.type = type;
    this._title = title;
  }

  get title() {
    if (!this._title) {
      return `${this.type}: ${this.target.id}`;
    }
    return `${this.type}: ${this.target.id}\r\n ${this._title}`;
  }
}
