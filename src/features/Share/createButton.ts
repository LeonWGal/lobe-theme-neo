import { Share2, svgIcon } from '@/icons/native';

export const createButton = (type: string, setOpen: (open: boolean) => void): HTMLButtonElement => {
  const button = document.createElement('button');
  button.id = `lobe_share_${type}`;
  button.type = 'button';
  button.innerHTML = svgIcon(Share2);
  button.dataset.lobeLocalized = '';
  button.className = 'lg secondary gradio-button tool';
  button.addEventListener('click', () => setOpen(true));
  return button;
};

export const adoptButtonClass = (button: HTMLElement, reference?: HTMLElement | null) => {
  const native = reference?.querySelector<HTMLElement>('button') || document.querySelector<HTMLElement>('#txt2img_tools button');
  if (native) button.classList.add(...native.classList);
};

