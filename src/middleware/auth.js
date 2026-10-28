import { createClient } from '@supabase/supabase-js';
import { AppError } from './errors.js';
export async function requireUser(req,_res,next) {
  try {
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new AppError(401,'UNAUTHENTICATED','Sign in to continue.');
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) throw new AppError(503,'CONFIGURATION_REQUIRED','Supabase is not configured.');
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth:{persistSession:false,autoRefreshToken:false}, global:{headers:{Authorization:`Bearer ${token}`}} });
    const {data:{user},error} = await client.auth.getUser(token);
    if (error || !user) throw new AppError(401,'INVALID_TOKEN','Your session has expired. Please sign in again.');
    req.user=user; req.db=client; next();
  } catch(e) { next(e); }
}
