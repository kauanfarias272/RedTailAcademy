
# RedTail Academy

App de mandarim com trilha de licoes, flashcards, treino de fala, treino de escrita hanzi, aba de estudo com memes/musicas e mascote estilo Tamagotchi.

## Destaques (v0.2.0)

- Trilha tematica do Carpa-Dragao (鯉魚跳龍門): Nadando na lagoa, Subindo o rio, Cachoeira do Dragao, Saltando o Portao.
- Resposta da licao trava no primeiro clique: errou, vai direto para a aba Erros e nao sai do bloqueio so apertando outro botao.
- Aba Erros no nivel superior, com badge contando os pendentes e correcao individual de cada item.
- Modo Chunks (tecnica Influx): blocos prontos como 我喜欢喝咖啡, com estudo + gap-fill e ida automatica para Erros se errar.
- Perfil com gerenciamento de conta: sair, apagar progresso local, excluir conta no Firebase com reauth automatico.
- Mascote Koi com evolucao aleatoria para Dragao ou Gaviao Peng, bloqueada enquanto houver erros pendentes.
- Validador de escrita mais rigoroso por tracos, cobertura e zonas do hanzi.
- Streak freeze comprado com moedas, metas pessoais, metas diarias e ranking semanal.
- Aba Estudar com referencias culturais como Super Idol, John Cena em mandarim, hino chines e cancoes historicas.

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

- `RedTailAcademy-v0.2.0-debug.apk`
- `RedTailAcademy-v0.2.0-release-unsigned.apk`
- `RedTailAcademy-v0.2.0-release.aab`
