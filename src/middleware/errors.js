export class AppError extends Error { constructor(status, code, message, details) { super(message); this.status=status; this.code=code; this.details=details; } }
export function errorHandler(err, _req, res, _next) {
  if (err.name === 'ZodError') return res.status(400).json({ data:null, error:{ code:'VALIDATION_ERROR', message:'Please check the highlighted information.', details: err.issues?.map(i=>({field:i.path.join('.'),message:i.message})) } });
  const status = err.status || 500;
  if (status >= 500) console.error(err.message);
  res.status(status).json({ data:null, error:{ code:err.code || 'INTERNAL_ERROR', message: status >= 500 ? 'The request could not be completed.' : err.message, ...(err.details ? {details:err.details} : {}) } });
}
