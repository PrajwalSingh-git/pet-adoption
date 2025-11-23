import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret for authentication
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized access attempt to cleanup function');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting application cleanup job...');

    // Find applications where deletion_scheduled_at is in the past
    const { data: applicationsToDelete, error: fetchError } = await supabase
      .from('applications')
      .select('id, pet_id, status, deletion_scheduled_at')
      .not('deletion_scheduled_at', 'is', null)
      .lt('deletion_scheduled_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching applications:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${applicationsToDelete?.length || 0} applications to delete`);

    if (!applicationsToDelete || applicationsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No applications to delete',
          deletedCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Delete the applications
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .in('id', applicationsToDelete.map(app => app.id));

    if (deleteError) {
      console.error('Error deleting applications:', deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted ${applicationsToDelete.length} applications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deleted ${applicationsToDelete.length} applications`,
        deletedCount: applicationsToDelete.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in cleanup job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
