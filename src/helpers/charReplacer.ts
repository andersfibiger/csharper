import { SearchCharacter, Searcher } from '../models/types';

export interface ICharReplacer {
  replaceCharacter(parameters: string, searchCharacter: SearchCharacter): string;
}

export class CharReplacer implements ICharReplacer {

  public replaceCharacter(parameters: string, searchCharacter: SearchCharacter): string {
    var newParameters = '';
    var searcher = {
      count: 0,
      searchCharacter
    };

    for (let i = 0; i < parameters.length; ++i) {
      const char = parameters.charAt(i);
      newParameters = this._handleChar(char, newParameters, searcher);
    }

    return newParameters;
  }

  private _handleChar(char: string, newParameters: string, searcher: Searcher): string {
    if (char === '<') {
      ++searcher.count;
      return newParameters + char;
    }

    if (char === '>') {
      --searcher.count;
      return newParameters + char;
    }

    if (char === searcher.searchCharacter && searcher.count === 0) {
      return newParameters + ((searcher.searchCharacter === ',') ? '-' : ',');
    }

    return newParameters + char;
  }
}