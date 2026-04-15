export default interface Observer {
  update(order: any, status: string): void;
}