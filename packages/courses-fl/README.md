# Conteúdo FL (Fórmula de Lançamento)

Dados importados do portal local `Desktop/FL` (curriculum, notas, bônus, manifest de vídeos).

- **Mídia (MP4/PDF):** não versionada no Git. Enquanto os vídeos não forem baixados, o player usa **`telegram-config.json`** + **`telegram-message-map.json`** (botão **Abrir no Telegram**).
- Depois do download local, configure `FL_MEDIA_ROOT` na API — o player prioriza MP4 e mantém Telegram como backup.

Para re-sincronizar JSON após atualizar o portal local:

```powershell
Copy-Item "$env:USERPROFILE\Desktop\FL\data\*.json" -Destination "packages\courses-fl\data\" -Force
```
