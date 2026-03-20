import React from 'react';

/** 与 `public/img/logo.png` 一致：白底横向 lockup（3D D + DREAM.ONE），适于浅底顶栏直接平铺 */
export const DREAM_ONE_LOGO_SRC = '/img/logo.png';

export type DreamOneLogoProps = {
  className?: string;
  /** 外层盒子 class（仅在与 trimExcessCanvas 联用时生效） */
  wrapperClassName?: string;
  /**
   * 素材为宽幅画布时，用 cover 裁切四周留白，使 lockup 在固定框内更大、更清晰。
   * 此时请把可视尺寸写在 wrapperClassName（如 h-10 w-48），img 用 className="h-full w-full"。
   */
  trimExcessCanvas?: boolean;
  alt?: string;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

export function DreamOneLogo({
  className = 'h-9 w-auto',
  wrapperClassName,
  trimExcessCanvas = false,
  alt = 'DREAM.ONE',
  ...rest
}: DreamOneLogoProps) {
  const img = (
    <img
      src={DREAM_ONE_LOGO_SRC}
      alt={alt}
      className={
        trimExcessCanvas
          ? `object-cover object-center ${className}`.trim()
          : `object-contain ${className}`.trim()
      }
      draggable={false}
      {...rest}
    />
  );

  if (!trimExcessCanvas) return img;

  return (
    <span
      className={`inline-flex max-w-full overflow-hidden ${wrapperClassName ?? ''}`.trim()}
    >
      {img}
    </span>
  );
}
