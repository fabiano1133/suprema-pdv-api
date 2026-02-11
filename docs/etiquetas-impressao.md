# Etiquetas — impressão em todos os navegadores e SO

## Ajustes na API (backend)

A resposta do `POST /api/v1/items/labels/pdf` foi configurada para padronizar a abertura e impressão:

- **Content-Disposition: inline** — o PDF abre no visualizador do navegador em vez de forçar download.
- **Cache-Control / Pragma** — evita cache; cada geração retorna um PDF novo.
- **X-Content-Type-Options: nosniff** — o navegador trata a resposta sempre como PDF.
- **Content-Length** — informado para o navegador saber o tamanho do arquivo.

## Recomendações para o frontend

Para reduzir o problema da caixa de impressão abrir e fechar (e o usuário precisar tentar várias vezes):

1. **Abrir o PDF em nova aba/janela**
   - Use a URL do blob (ou do endpoint, se for GET) em `window.open(url, '_blank')` ou em um `<iframe>`.
   - Evite chamar `window.print()` na **mesma** aba antes do PDF estar totalmente carregado.

2. **Esperar o carregamento antes de imprimir**
   - Se o front chama `window.print()` automaticamente, só chame depois do evento **load** da janela/iframe onde o PDF foi aberto.
   - Exemplo (nova janela com blob):
     ```js
     const blob = await response.blob();
     const url = URL.createObjectURL(blob);
     const w = window.open(url, '_blank');
     if (w) {
       w.onload = () => {
         w.print();
         // Só revogue o URL depois de um tempo (permite o diálogo de impressão fechar)
         setTimeout(() => URL.revokeObjectURL(url), 60000);
       };
     }
     ```
   - Em alguns navegadores, o `load` do PDF pode demorar; considere um pequeno `setTimeout` antes de `print()` (ex.: 300–500 ms).

3. **Não revogar o object URL imediatamente**
   - Manter o `URL.createObjectURL(blob)` válido até depois que o usuário fechar o diálogo de impressão (ou usar um timeout generoso antes de `revokeObjectURL`).

4. **Fallback: deixar o usuário imprimir**
   - Abrir o PDF em nova aba com `Content-Disposition: inline` e **não** chamar `print()` automaticamente. O usuário usa Ctrl+P / Cmd+P ou o botão de imprimir do navegador. Esse fluxo costuma ser o mais estável em todos os SO e navegadores.
