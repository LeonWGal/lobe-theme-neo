import { FluentEmoji, getEmoji } from '@lobehub/fluent-emoji';
import { LobeHub } from '@lobehub/ui/brand';
import type { CSSProperties } from 'react';

export default function EmojiLogo({
  emoji,
  size,
  style,
}: {
  emoji: string;
  size: number;
  style?: CSSProperties;
}) {
  const value = getEmoji(emoji);
  return value ? (
    <FluentEmoji emoji={value} size={size} style={style} />
  ) : (
    <LobeHub size={size} style={style} />
  );
}
