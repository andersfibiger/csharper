
export interface IDependencyTypeHelper {
  get(param: string): string;
}

export class DependencyTypeHelper implements IDependencyTypeHelper {

  public get(param: string): string {
    param = param.trim();
    const indexOfLastSpace = param.lastIndexOf(' ');
    return param.substring(0, indexOfLastSpace);
  }
} 