
# RedTail Academy

App de mandarim com trilha de licoes, flashcards, treino de fala, treino de escrita hanzi, aba de estudo com memes/musicas e mascote estilo Tamagotchi.

## Destaques (v0.2.1)

- Login Google com fallback automatico para signInWithRedirect quando o popup e bloqueado pelo navegador/WebView.
- Faixa de "missao diaria" gigante substituida por uma pill compacta na topbar com popover das 4 missoes do dia.
- Aba Cla: trio de aprendizes com codigo de 6 letras, ranking de clas por XP total (com bonus +25% sobre o XP individual), mascote coletivo e papel de dono. Persistido no Firestore (precisa rules abaixo).
- Trilha tematica do Carpa-Dragao (鯉魚跳龍門): Nadando na lagoa, Subindo o rio, Cachoeira do Dragao, Saltando o Portao.
- Resposta da licao trava no primeiro clique: errou, vai direto para a aba Erros e nao sai do bloqueio so apertando outro botao.
- Aba Erros no nivel superior, com badge contando os pendentes e correcao individual de cada item.
- Modo Chunks (tecnica Influx): blocos prontos como 我喜欢喝咖啡, com estudo + gap-fill e ida automatica para Erros se errar.
- Perfil com gerenciamento de conta: sair, apagar progresso local, excluir conta no Firebase com reauth automatico.
- Mascote Koi com evolucao aleatoria para Dragao ou Gaviao Peng, bloqueada enquanto houver erros pendentes.
- Validador de escrita mais rigoroso por tracos, cobertura e zonas do hanzi.
- Streak freeze comprado com moedas, metas pessoais, metas diarias e ranking semanal.
- Aba Estudar com referencias culturais como Super Idol, John Cena em mandarim, hino chines e cancoes historicas.

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

- `RedTailAcademy-v0.2.1-debug.apk`
- `RedTailAcademy-v0.2.1-release-unsigned.apk`
- `RedTailAcademy-v0.2.1-release.aab`
