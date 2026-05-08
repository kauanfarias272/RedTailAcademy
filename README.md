
# RedTail Academy

App de mandarim com trilha de licoes, flashcards, treino de fala, treino de escrita hanzi, aba de estudo com memes/musicas e mascote estilo Tamagotchi.

## Destaques (v0.2.13)

- Trilha com SRS dentro das licoes: frases antigas voltam antes do input novo para fixar memoria sem virar revisao solta.
- Fluxo inspirado em Krashen: a aula separa "Revisao Anki" de "Input novo i+1", dando contexto compreensivel antes da cobranca.
- Aba Treino com Anki mais completo: fila por vencimento, caixas, lapsos, previsao de intervalo e deck vivo com novos/em aprendizado/maduros.
- Login Google sem redirect quebrado: Android usa o plugin nativo; web usa popup com mensagem clara quando o navegador bloqueia.
- Aba Cla: trio de aprendizes com codigo de 6 letras, ranking de clas por XP total (com bonus +25% sobre o XP individual), mascote coletivo e papel de dono. Persistido no Firestore (precisa rules abaixo).
- Trilha tematica do Carpa-Dragao: Nadando na lagoa, Subindo o rio, Cachoeira do Dragao, Saltando o Portao e checkpoints HSK1.
- Resposta da licao trava no primeiro clique: errou, vai direto para a aba Erros e nao sai do bloqueio so apertando outro botao.
- Modo Chunks (tecnica Influx): blocos prontos com estudo + gap-fill e ida automatica para Erros se errar.
- Escrita hanzi com tela "Iniciar licao", guia de ordem de tracos, bolinhas numeradas e validador mais rigoroso.
- Mascote Koi agora segue apenas a evolucao Koi -> Dragao, com 36 tipos de koi e 8 niveis de transformacao.
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

- `RedTailAcademy-v0.2.13-debug.apk`
- `RedTailAcademy-v0.2.13-release-unsigned.apk`
- `RedTailAcademy-v0.2.13-release.aab`
