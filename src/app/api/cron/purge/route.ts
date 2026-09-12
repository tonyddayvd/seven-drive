import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Endpoint de execução agendada (Vercel Cron ou chamada periódica)
// URL: /api/cron/purge
export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase credentials not configured." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Tenta invocar a Stored Procedure PostgreSQL de purga (se criada)
    const { data: rpcData, error: rpcError } = await supabase.rpc("purge_old_temporary_media");

    if (!rpcError) {
      return NextResponse.json({
        success: true,
        message: "Purga de mídia temporária (>60 dias) executada via RPC com sucesso.",
        deletedObjectsCount: rpcData,
      });
    }

    // 2. Fallback via API do Supabase Storage
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: files, error: listError } = await supabase.storage
      .from("temporary-media")
      .list();

    if (listError) {
      return NextResponse.json({
        success: false,
        message: "Bucket 'temporary-media' não inicializado ou sem arquivos antigos.",
        detail: listError.message,
      });
    }

    const filesToDelete = (files || [])
      .filter((file) => file.created_at && new Date(file.created_at) < sixtyDaysAgo)
      .map((file) => file.name);

    let deletedCount = 0;
    if (filesToDelete.length > 0) {
      const { data: delData, error: delError } = await supabase.storage
        .from("temporary-media")
        .remove(filesToDelete);

      if (!delError && delData) {
        deletedCount = delData.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Purga executada: ${deletedCount} arquivos temporários antigos excluídos. Documentos CNH e CRLV em 'documents-fixed' mantidos intactos.`,
      purgedFiles: filesToDelete,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
