
export const getDependencyType = (param: string): string => {
  param = param.trim();
  const indexOfLastSpace = param.lastIndexOf(' ');
  return param.substring(0, indexOfLastSpace);
}
