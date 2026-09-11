import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redireciona non-www para www com 301 permanente.
 * shkgroup.com.br → www.shkgroup.com.br (mantém path e query string).
 *
 * Pré-requisito: o domínio non-www precisa estar configurado no EasyPanel
 * apontando para o mesmo serviço. Se não estiver, o request nem chega aqui.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Só redireciona se o host é exatamente o domínio naked (sem www)
  if (host === 'shkgroup.com.br') {
    const url = request.nextUrl.clone();
    url.host = 'www.shkgroup.com.br';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Não rodar middleware em assets estáticos, _next, api routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|cinematic|brand|api).*)'],
};
