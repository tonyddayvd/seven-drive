const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
  const { data: maints, error } = await supabase.from('maintenances').select('*');
  console.log('Error:', error);
  console.log('Maintenances count:', maints ? maints.length : 0);
  if (maints) {
    maints.forEach(m => {
      console.log('ID:', m.id, 'status:', m.status, 'item:', m.tipo_item, 'valor:', m.valor_custo, 'nota_url:', m.foto_nota_url ? (m.foto_nota_url.substring(0, 60) + '... len:' + m.foto_nota_url.length) : 'null');
    });
  }
}
inspect();
