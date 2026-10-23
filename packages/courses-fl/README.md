# Conteúdo FL (Fórmula de Lançamento)

Dados importados do portal local `Desktop/FL` (curriculum, notas, bônus, manifest de vídeos).

- **Mídia (MP4/PDF):** não versionada no Git. Configure `FL_MEDIA_ROOT` na API apontando para a pasta `media/` do projeto FL ou para um disco no Render.

Para re-sincronizar JSON após atualizar o portal local:

```powershell
Copy-Item "$env:USERPROFILE\Desktop\FL\data\*.json" -Destination "packages\courses-fl\data\" -Force
```
