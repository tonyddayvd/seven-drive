import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Endpoint de execução agendada (Vercel Cron ou chamada periódica)
// URL: /api/cron/purge
// Política: Hospedagem temporária de 90 dias para vistorias e comprovantes bancários.
// Documentos permanentes (CNH dos motoristas e CRLV dos veículos) são preservados para sempre.
export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Credenciais do Supabase não configuradas." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoISO = ninetyDaysAgo.toISOString();

    // 1. Tenta invocar a Stored Procedure PostgreSQL de purga (se configurada no banco)
    try {
      await supabase.rpc("purge_old_temporary_media");
    } catch {
      // Ignora erro de RPC inexistente
    }

    // 2. Limpeza de Storage Buckets (temporary-media)
    let deletedStorageFilesCount = 0;
    try {
      const { data: files } = await supabase.storage.from("temporary-media").list();
      if (files && files.length > 0) {
        const filesToDelete = files
          .filter((file) => file.created_at && new Date(file.created_at) < ninetyDaysAgo)
          .map((file) => file.name);

        if (filesToDelete.length > 0) {
          const { data: delData } = await supabase.storage
            .from("temporary-media")
            .remove(filesToDelete);
          deletedStorageFilesCount = delData ? delData.length : filesToDelete.length;
        }
      }
    } catch (storageErr) {
      console.warn("Aviso na purga de storage:", storageErr);
    }

    // 3. Purga dos campos pesados de fotos de vistorias com mais de 90 dias na tabela inspections
    // Mantém o registro histórico de KM, status e auditoria, mas desocupa espaço liberando as fotos.
    let cleanedInspectionsCount = 0;
    try {
      const { data: oldInspections, error: inspErr } = await supabase
        .from("inspections")
        .select("id")
        .lt("created_at", ninetyDaysAgoISO);

      if (!inspErr && oldInspections && oldInspections.length > 0) {
        cleanedInspectionsCount = oldInspections.length;
        const ids = oldInspections.map((i) => i.id);
        await supabase
          .from("inspections")
          .update({
            foto_frente_url: null,
            foto_lateral_esq_url: null,
            foto_lateral_dir_url: null,
            foto_traseira_url: null,
            foto_interior_url: null,
            foto_odometro_url: null,
            observacoes: "Mídia de fotos expirada após política de retenção de 90 dias.",
          })
          .in("id", ids);
      }
    } catch (tableErr) {
      console.warn("Aviso na purga de fotos de inspeções antigas:", tableErr);
    }

    // 4. Purga dos comprovantes bancários com mais de 90 dias em pagamentos já quitados/confirmados
    let cleanedPaymentsCount = 0;
    try {
      const { data: oldPayments, error: payErr } = await supabase
        .from("payments")
        .select("id")
        .eq("status", "confirmado")
        .lt("created_at", ninetyDaysAgoISO);

      if (!payErr && oldPayments && oldPayments.length > 0) {
        cleanedPaymentsCount = oldPayments.length;
        const payIds = oldPayments.map((p) => p.id);
        await supabase
          .from("payments")
          .update({
            comprovante_url: null,
          })
          .in("id", payIds);
      }
    } catch (payTableErr) {
      console.warn("Aviso na purga de comprovantes antigos:", payTableErr);
    }

    return NextResponse.json({
      success: true,
      retentionDays: 90,
      message: `Purga executada com sucesso! Objetos de storage excluídos: ${deletedStorageFilesCount}, vistorias limpas: ${cleanedInspectionsCount}, comprovantes arquivados: ${cleanedPaymentsCount}. CNH e CRLV em 'documents-fixed' mantidos intactos.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
