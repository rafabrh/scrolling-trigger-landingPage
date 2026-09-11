'use client';

import Script from 'next/script';
import { FB_PIXEL_ID } from '@/lib/tracking/ids';

/**
 * Facebook Pixel — carrega o fbevents.js, inicializa o pixel e dispara PageView.
 * Usa next/script com strategy="afterInteractive" para não bloquear o render.
 *
 * O Pixel só inicializa se o Consent Mode do GTM concedeu ad_storage.
 * Enquanto não existir banner de consentimento (todas as categorias ficam
 * denied por padrão), o Pixel carrega mas NÃO dispara eventos — alinhado
 * com o consentimento gerido pelo GTM.
 */
export function FacebookPixel() {
  return (
    <Script
      id="fb-pixel-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('consent', 'revoke');
fbq('init', '${FB_PIXEL_ID}');
`,
      }}
    />
  );
}
