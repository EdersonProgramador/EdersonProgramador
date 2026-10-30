-- Snapshot dos dados do contratante no momento da assinatura (contrato final).
ALTER TABLE "Project" ADD COLUMN "contractPartyJson" JSONB;
