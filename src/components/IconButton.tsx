import type { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  'aria-label': string;
}

/** Real, keyboard-focusable <button> wrapper for icon-only controls. Requires aria-label. */
const IconButton = ({ icon, className, ...rest }: IconButtonProps) => (
  <button type="button" className={`icon-btn-bare ${className ?? ''}`} {...rest}>
    <i className={icon} aria-hidden="true"></i>
  </button>
);

export default IconButton;
