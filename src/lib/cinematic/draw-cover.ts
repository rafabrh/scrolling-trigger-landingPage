export interface CoverRect {
  readonly dx: number;
  readonly dy: number;
  readonly dw: number;
  readonly dh: number;
}

const EMPTY: CoverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };

/**
 * Retângulo de destino que cobre o alvo inteiro preservando a proporção da
 * fonte, centralizado. Equivalente a `object-fit: cover`.
 */
export function drawCoverDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): CoverRect {
  if (sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    return EMPTY;
  }

  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const dw = sourceWidth * scale;
  const dh = sourceHeight * scale;

  return {
    dx: (targetWidth - dw) / 2,
    dy: (targetHeight - dh) / 2,
    dw,
    dh,
  };
}

/** Desenha uma imagem cobrindo o canvas inteiro, sem deformar. */
export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): void {
  const { dx, dy, dw, dh } = drawCoverDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight);
  if (dw <= 0 || dh <= 0) return;
  ctx.drawImage(image, dx, dy, dw, dh);
}
