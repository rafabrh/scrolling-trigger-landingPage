# SHK GROUP

https://www.shkgroup.com.br/

Site institucional scroll-driven. O scroll controla frame a frame uma sequência
cinematográfica renderizada em Canvas, e o último frame vira o fundo fixo do
site inteiro.

## Como rodar

```bash
pnpm install
pnpm frames   # extrai as sequências de frames do vídeo master
pnpm dev
```

`pnpm frames` lê `context/video/rafa3.mp4` e grava `public/cinematic/`. As
sequências ficam fora do histórico do git por serem reproduzíveis; o manifest e
os frames avulsos são versionados.

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm test` | Testes da lógica pura |
| `pnpm typecheck` | `tsc --noEmit` em strict |
| `pnpm frames` | Regenera as sequências de frames e o manifest |

Modo de calibragem: `?cinematicDebug=true` mostra progresso, frame, cena, frames
carregados e fps de desenho. Desligado por padrão em qualquer ambiente.

## Documentação

- Spec: `docs/superpowers/specs/2026-08-19-shk-cinematic-site-design.md`
- Plano de implementação: `docs/superpowers/plans/2026-08-19-shk-cinematic-site.md`
- Direção visual: `design-canvas/shk-group-direcao-visual.html`
