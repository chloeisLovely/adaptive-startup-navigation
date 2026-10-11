// Only pass the server-verified Auth /user response, never browser claims/metadata.
export function verifiedAdminEmail(user){
 if(!user?.id||typeof user.email!=='string'||!user.email_confirmed_at||!Number.isFinite(Date.parse(user.email_confirmed_at)))return null;
 const email=user.email.trim().toLowerCase();
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:null;
}
