export function rpx_UTC(time: string): string | Date {
  const formattedTime = time.replace(' ', 'T') + 'Z';
  return new Date(formattedTime);
}
