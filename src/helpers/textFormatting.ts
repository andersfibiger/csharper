import { getIndentation, handleParametersNames } from '../helpers';
import { UnitUnderTest } from '../models/types';

export const getMockName = (dependency: string) => {
  const name = handleParametersNames(dependency);
  return `_mock${name.substr(1, name.length)}`;
}

export const getMockMember = (dependency: string) =>
  `private readonly Mock<${dependency}> ${getMockName(dependency)};\n`;

export const addConstructor = (constructorName: string) =>
  `\n${getIndentation()}public ${constructorName}()\n${getIndentation()}{\n`;

export const initializeCtor = (uut: UnitUnderTest, mocks: string[]): string =>
  `${getIndentation()}  ${uut.name} = new ${uut.type}(${mocks.map(m => `${m}.Object`)});`;

export const initializeMock = (dependency: string) =>
  `${getIndentation()}  ${getMockName(dependency)} = new Mock<${dependency}>();\n`;