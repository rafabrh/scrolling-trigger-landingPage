export const WHATSAPP_URL = 'https://wa.me/5511912839594';
export const INSTAGRAM_URL = 'https://instagram.com/shkgroup.ia';

/**
 * Link de WhatsApp com a posição de origem no `text`. O wa.me pré-preenche o
 * rascunho da conversa com esse texto, e o WhatsApp o preserva até o usuário
 * enviar — então a etiqueta `[via: posição]` chega na caixa de entrada e a
 * conversão fica contável por ponto de saída, sem pixel, sem cookie e sem nada
 * a declarar de LGPD. Dez âncoras que antes eram indistinguíveis passam a dizer
 * de onde vieram. O usuário pode apagar a linha antes de enviar; o custo de
 * errar para menos é só perder a contagem daquele clique.
 *
 * Vive num módulo próprio, separado do deck de copy inteiro, porque a ilha
 * cinematic (client component) precisa dele e da `cinematic-copy`. Se estivesse
 * junto de `SITE_CONTENT`, importar o helper arrastaria todo o deck para o
 * bundle do cliente.
 */
export function whatsappHref(position: string): string {
  const text = `Hi SHK Group! I came from the site and I'd like to talk. [via: ${position}]`;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
}
