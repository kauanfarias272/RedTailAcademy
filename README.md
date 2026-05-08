
# RedTail Academy

App de mandarim com trilha de licoes, flashcards, treino de fala, treino de escrita hanzi, aba de estudo com memes/musicas e mascote estilo Tamagotchi.

## Destaques (v0.2.15)

- Licoes agora têm teto real de 7 exercicios por sessao, contando revisoes Anki e input novo.
- Mais repeticao do basico: itens de fundacao voltam no começo das licoes antes das frases novas.
- Microanimacoes de toque, entrada e resposta deixam a UI mais fluida e menos travada.
- Painel de pronuncia/literal ficou compacto e nao cobre mais as opcoes de resposta.
- Escrita hanzi abre em estudo guiado, depois canvas limpo; acertou, mostra curiosidade e avanca para o proximo caractere.
- Trilha com SRS dentro das licoes: frases antigas voltam antes do input novo para fixar memoria sem virar revisao solta.
- Fluxo inspirado em Krashen: a aula separa "Revisao Anki" de "Input novo i+1", dando contexto compreensivel antes da cobranca.
- Aba Treino com Anki mais completo: fila por vencimento, caixas, lapsos, previsao de intervalo e deck vivo com novos/em aprendizado/maduros.
- Rota Peng restaurada: 5 linhagens (Koi, Arowana, Dourado, Lutador e Borboleta) com evolucao ate o nivel 10.
- Checkpoints e conclusao de licao agora mostram o mascote real do usuario, com mensagem de parabens, Evo XP, XP, moedas e evolucao.
- Lembretes diarios de estudo via notificacoes locais no Android.
- Login Google sem redirect quebrado: Android usa o plugin nativo; web usa popup com mensagem clara quando o navegador bloqueia.
- Aba Cla: trio de aprendizes com codigo de 6 letras, ranking de clas por XP total (com bonus +25% sobre o XP individual), mascote coletivo e papel de dono. Persistido no Firestore (precisa rules abaixo).
- Trilha tematica do Carpa-Dragao: Nadando na lagoa, Subindo o rio, Cachoeira do Dragao, Saltando o Portao e checkpoints HSK1.
- Resposta da licao trava no primeiro clique: errou, vai direto para a aba Erros e nao sai do bloqueio so apertando outro botao.
- Modo Chunks (tecnica Influx): blocos prontos com estudo + gap-fill e ida automatica para Erros se errar.
- Escrita hanzi com tela "Iniciar licao", guia de ordem de tracos, bolinhas numeradas e validador mais rigoroso.
- Mascote Koi pode seguir a rota Dragao (36 tipos, nivel 8) ou a rota Peng (5 tipos, nivel 10).
- Streak freeze comprado com moedas, metas pessoais, metas diarias e ranking semanal.
- Aba Cultura com referencias culturais como Super Idol, John Cena em mandarim, hino chines e cancoes historicas.

## Firestore rules (necessarias para o cla)

A aba Cla escreve em `clans/{clanId}` e `users/{uid}`. Aplicar no Firebase Console > Firestore > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clans/{clanId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.ownerUid == request.auth.uid
        && request.resource.data.memberUids.size() == 1
        && request.auth.uid in request.resource.data.memberUids;
      allow update: if request.auth != null
        && (request.auth.uid in resource.data.memberUids
            || request.auth.uid in request.resource.data.memberUids);
      allow delete: if request.auth != null
        && resource.data.ownerUid == request.auth.uid;
    }
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run android:apk
npm run android:release
```

## Artefatos Android

Os APK/AAB versionados ficam na raiz do projeto, por exemplo:

- `RedTailAcademy-v0.2.15-debug.apk`
- `RedTailAcademy-v0.2.15-release-unsigned.apk`
- `RedTailAcademy-v0.2.15-release.aab`
