import * as monaco from 'monaco-editor';
import { checkMonacoReady } from '../MonacoEditor';

checkMonacoReady(() => {
  monaco.languages.register({ id: 'datax' });
  monaco.languages.setMonarchTokensProvider('datax', {
    tokenizer: {
      root: [
        [ /@[a-zA-Z_$][\w$]*\b/, { token: 'data-field', _log: 'annotation token: $0' } ],
        [
          /(\/\/\/\s+)((?:[-+!*]\s+)?)([A-Za-z]+(?:,[A-Za-z]+)*\s+)(.+)/,
          [ 'document-token', 'document-change-flag', 'document-field-type', 'document-field-description' ],
        ],
      ],
    },
  });
  monaco.languages.setLanguageConfiguration('datax', {
    brackets: [
      [ '{', '}' ],
      [ '[', ']' ],
      [ '(', ')' ],
    ],
    autoClosingPairs: [
      { open: '{', close: '}', notIn: [ 'string' ] },
      { open: '[', close: ']', notIn: [ 'string' ] },
      { open: '(', close: ')', notIn: [ 'string' ] },
      { open: '"', close: '"', notIn: [ 'string' ] },
      { open: '\'', close: '\'', notIn: [ 'string' ] },
    ],
  });
  monaco.editor.defineTheme('datax', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'data-field', foreground: '569cd6' },
      { token: 'document-token', foreground: '808080' },
      { token: 'document-change-flag', foreground: '808080' },
      { token: 'document-field-type', foreground: '808080', fontStyle: 'normal' },
      { token: 'document-field-description', foreground: '808080' },
    ],
  });
});
