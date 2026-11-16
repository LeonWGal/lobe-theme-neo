import { Converter } from '@/scripts/formatPrompt';
import { Undo, Wand2, svgIcon } from '@/icons/native';

export const createButton = (type: 'txt' | 'img') => {
  const button = document.createElement('button');
  button.id = `${type}2img_formatconvert`;
  button.type = 'button';
  button.innerHTML = svgIcon(Wand2);
  button.className = 'lg secondary gradio-button tool';
  button.addEventListener('click', () => Converter.onClickConvert(type));
  const undo = document.createElement('button');
  undo.type = 'button';
  undo.className = button.className;
  undo.innerHTML = svgIcon(Undo);
  undo.onclick = () => Converter.undo(type);
  const tools = document.createElement('div');
  tools.className = 'lobe-prompt-format-tools';
  tools.dataset.lobeLocalized = '';
  tools.append(button, undo);
  return tools;
};
